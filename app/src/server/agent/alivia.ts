import type { ChatSession, PrismaClient } from "@prisma/client";
import { ALIVIA_SYSTEM_PROMPT } from "./prompts/aliviaSystemPrompt";
import type { LLMProvider } from "./llm/provider";
import {
  readState,
  updateSessionState,
  type ConversationState,
} from "./chatSession";
import { classifyIntent, type Intent } from "./router";
import { buildConfirmationRequest, extractEntities, parseConfirmation, persistCase } from "./tools";
import { computeCorroborationScore } from "./_score";
import { findMatchingEntities, getDossier, normalizeLabel } from "../graph/queries";
import type { AporteCase } from "./_schema";

/**
 * Orquestador del agente Alivia. Recibe un mensaje del usuario, mantiene
 * estado conversacional en ChatSession, y devuelve la respuesta + side-effects
 * que el bot debe ejecutar (mostrar texto, mintear NFT, etc.).
 *
 * Spec: 01-agent-behavior + 05-architecture §3.3-3.4.
 */

export interface AgentDeps {
  prisma: PrismaClient;
  llm: LLMProvider;
}

export interface AgentTurnInput {
  session: ChatSession;
  userMessage: string;
  history?: string[];
}

export interface AgentTurnOutput {
  text: string;
  /** Si el aporte cristalizó y queda listo para minteo. F4 lo recibe. */
  caseToMint?: AporteCase;
}

async function getSystemPrompt(): Promise<string> {
  return ALIVIA_SYSTEM_PROMPT;
}

const FINALIZE_TRIGGERS = /\b(publicar|publica|publicalo|listo|ya|cierra|cerrar)\b/i;
const MAX_INTERVIEW_TURNS = 6;

const RESET_TRIGGERS = /^\s*(\/start|\/reset|empezar de nuevo|reiniciar)\s*$/i;

export async function runAgentTurn(
  deps: AgentDeps,
  input: AgentTurnInput,
): Promise<AgentTurnOutput> {
  // Reset explícito: limpia la sesión y responde con saludo via LLM.
  if (RESET_TRIGGERS.test(input.userMessage)) {
    await updateSessionState(deps.prisma, input.session.id, {
      intent: null,
      partialCase: {},
      turnCount: 0,
    });
    return runConversational(deps, "Hola, ¿en qué me presento? Saluda al usuario en 2-3 líneas.", []);
  }

  const state = readState(input.session);

  // 1. R10: si hay aporte pendiente esperando confirmación, procesar primero.
  if (state.partialCase.pendingConfirmation) {
    return handleConfirmation(deps, input.session, state, input.userMessage);
  }

  // 2. Si ya estamos en flujo de denuncia activo, seguir ahí (la entrevista
  //    es multi-turno hasta que el usuario diga "publicar").
  if (state.intent === "denuncia") {
    return runDenunciaFlow(deps, input.session, state, input.userMessage, input.history);
  }

  // 3. Si NO hay flujo activo, clasificar este mensaje para ver si arranca uno.
  const intent = await classifyIntent(deps.llm, input.userMessage, input.history);

  if (intent === "denuncia") {
    await updateSessionState(deps.prisma, input.session.id, { intent });
    return runDenunciaFlow(deps, input.session, state, input.userMessage, input.history);
  }

  if (intent === "consulta") {
    // Intenta resolver desde el grafo. Si no hay match, cae al chat conversacional
    // (no se pega a "consulta" en la sesión).
    const dossier = await tryConsultaFromGraph(deps, input.userMessage);
    if (dossier) return { text: dossier };
  }

  // 4. Resto (fuera_alcance, consulta sin match, bounty/acta): conversación
  //    natural con el system prompt. NUNCA texto canned — Alivia tiene voz
  //    propia (instinct.md) que el LLM aplica.
  return runConversational(deps, input.userMessage, input.history);
}

// =============================================================================
// Flujo: DENUNCIA
// =============================================================================

async function runDenunciaFlow(
  deps: AgentDeps,
  session: ChatSession,
  state: ConversationState,
  userMessage: string,
  history?: string[],
): Promise<AgentTurnOutput> {
  // Detectar trigger explícito de finalización
  if (FINALIZE_TRIGGERS.test(userMessage) || state.turnCount >= MAX_INTERVIEW_TURNS) {
    return tryFinalize(deps, session, state, userMessage);
  }

  // Conversación natural usando el system prompt
  const systemPrompt = await getSystemPrompt();
  const llmResponse = await deps.llm.complete({
    messages: [
      { role: "system", content: systemPrompt },
      ...(history ?? []).slice(-6).map((m, i) => ({
        role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
        content: m,
      })),
      { role: "user", content: userMessage },
    ],
    temperature: 0.5,
    maxTokens: 400,
  });

  await updateSessionState(deps.prisma, session.id, {
    turnCount: state.turnCount + 1,
  });

  return { text: llmResponse.content };
}

async function tryFinalize(
  deps: AgentDeps,
  session: ChatSession,
  state: ConversationState,
  userMessage: string,
): Promise<AgentTurnOutput> {
  const rawText = [userMessage, ...Object.values(state.partialCase ?? {})].join("\n");
  const extracted = await extractEntities(deps.llm, rawText);

  const subjectPerson = extracted.people[0];
  if (!subjectPerson) {
    return {
      text: "Para publicar necesito al menos un nombre o entidad. ¿Quién es la persona o institución señalada?",
    };
  }

  const scoreFactors = inferScoreFactorsFromMessage(rawText);
  const score = computeCorroborationScore(scoreFactors);

  // Mostrar resumen + pedir confirmación (R10)
  const matches = await findMatchingEntities(
    deps.prisma,
    extracted.people.map((p) => p.full_name),
  );
  const matchHint =
    matches.length > 0
      ? `\nConexión detectada con nodo previo: "${matches[0].label}".`
      : "";

  const summary = `Resumen del aporte:\n- Sujeto: ${subjectPerson.full_name}${
    subjectPerson.role ? ` (${subjectPerson.role})` : ""
  }\n- Hechos: ${rawText.slice(0, 200)}...\n- Score de corroboración: ${score.toFixed(2)}${matchHint}`;

  const confirm = buildConfirmationRequest(summary);
  await updateSessionState(deps.prisma, session.id, {
    partialCase: {
      pendingConfirmation: true,
      rawText,
      extracted,
      scoreFactors,
    },
  });
  return { text: `${confirm.summary}\n\n${confirm.question}` };
}

async function handleConfirmation(
  deps: AgentDeps,
  session: ChatSession,
  state: ConversationState,
  userMessage: string,
): Promise<AgentTurnOutput> {
  const decision = parseConfirmation(userMessage);
  if (decision === "unclear") {
    return {
      text: "No entendí. Por favor responde *sí, confirmo* para publicar o *no* para cancelar.",
    };
  }
  if (decision === "reject") {
    await updateSessionState(deps.prisma, session.id, {
      intent: null,
      partialCase: {},
      turnCount: 0,
    });
    return { text: "Cancelado. Si quieres retomar, vuelve a escribirme." };
  }

  // confirm: persistir
  const pending = state.partialCase as Record<string, any>;
  const aporteCase = await persistCase(deps.prisma, {
    caseType: "nepotismo",
    subject: {
      name: pending.extracted.people[0].full_name,
      role: pending.extracted.people[0].role,
    },
    facts: [pending.rawText.slice(0, 500)],
    evidence: [],
    reporterPseudonym: session.pseudonym,
    scoreFactors: pending.scoreFactors,
    extracted: pending.extracted,
  });

  await updateSessionState(deps.prisma, session.id, {
    intent: null,
    partialCase: {},
    turnCount: 0,
  });

  return {
    text:
      `Listo. Tu aporte queda registrado con id ${aporteCase.case_id}.\n` +
      `Score de corroboración: ${aporteCase.corroboration_score.toFixed(2)}.\n` +
      `El NFT-Acta se minteará en Syscoin en segundos. Te aviso con el hash en cuanto esté.`,
    caseToMint: aporteCase,
  };
}

function inferScoreFactorsFromMessage(text: string) {
  const lower = text.toLowerCase();
  return {
    hasVerifiableLink: /https?:\/\/\S+/.test(text),
    hasFormalReference: /\b(ruc|resolucion|resolución|expediente|n[º°]\s*\d|2026|2025)\b/.test(lower),
    hasNameRoleMatch: false, // se completa con el cruce en persistCase
    additionalMatches: 0,
    independentReports: 0,
  };
}

// =============================================================================
// Flujo: CONSULTA (sólo se invoca si el grafo tiene match — sino cae a conv)
// =============================================================================

async function tryConsultaFromGraph(
  deps: AgentDeps,
  userMessage: string,
): Promise<string | null> {
  const nameMatch = userMessage.match(
    /(?:qui[eé]n es|qué sabes de|que sabes de|sobre)\s+([^?\.\n]+)/i,
  );
  const name = nameMatch?.[1]?.trim();
  if (!name || name.length < 3) return null;

  const candidates = await findMatchingEntities(deps.prisma, [name]);
  if (candidates.length === 0) return null;

  const dossier = await getDossier(deps.prisma, candidates[0].id);
  const edges = (dossier?.outgoingEdges ?? []).concat(dossier?.incomingEdges ?? []).slice(0, 5);
  const edgeSummary = edges
    .map((e) => `  · ${e.type.toLowerCase()} (confianza ${e.confidence.toFixed(2)})`)
    .join("\n");

  return (
    `Dossier de ${candidates[0].label} (${candidates[0].type.toLowerCase()}):\n` +
    (edgeSummary || "  · sin vínculos registrados") +
    `\nCasos asociados: ${dossier?.cases.length ?? 0}.\n\n` +
    `Si tienes información nueva sobre ${candidates[0].label}, escríbeme y la sumamos.`
  );
}

// =============================================================================
// Flujo: CONVERSACIONAL (default)
// Toda interacción que no sea denuncia-en-curso, confirmación R10 ni consulta
// con match en grafo, pasa por el LLM con el system prompt completo.
// Alivia conserva su voz (instinct.md) en cualquier respuesta.
// =============================================================================

async function runConversational(
  deps: AgentDeps,
  userMessage: string,
  history?: string[],
): Promise<AgentTurnOutput> {
  const systemPrompt = await getSystemPrompt();
  const response = await deps.llm.complete({
    messages: [
      { role: "system", content: systemPrompt },
      ...(history ?? []).slice(-6).map((m, i) => ({
        role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
        content: m,
      })),
      { role: "user", content: userMessage },
    ],
    temperature: 0.6,
    maxTokens: 350,
  });
  return { text: response.content };
}

// Re-export for ergonomic use in tools.ts / tests
export { normalizeLabel };
