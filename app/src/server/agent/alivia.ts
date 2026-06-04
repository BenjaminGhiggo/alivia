import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ChatSession, PrismaClient } from "@prisma/client";
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

const PROMPT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "prompts",
  "alivia-system.es.md",
);
let cachedSystemPrompt: string | null = null;

async function getSystemPrompt(): Promise<string> {
  if (!cachedSystemPrompt) {
    cachedSystemPrompt = await readFile(PROMPT_PATH, "utf-8");
  }
  return cachedSystemPrompt;
}

const FINALIZE_TRIGGERS = /\b(publicar|publica|publicalo|listo|ya|cierra|cerrar)\b/i;
const MAX_INTERVIEW_TURNS = 6;

export async function runAgentTurn(
  deps: AgentDeps,
  input: AgentTurnInput,
): Promise<AgentTurnOutput> {
  const state = readState(input.session);

  // 1. Si hay aporte pendiente esperando confirmación (R10), procesar.
  if (state.partialCase.pendingConfirmation) {
    return handleConfirmation(deps, input.session, state, input.userMessage);
  }

  // 2. Clasificar intent si aún no está fijado en la sesión.
  let intent: Intent = (state.intent as Intent | null) ?? "fuera_alcance";
  if (!state.intent) {
    intent = await classifyIntent(deps.llm, input.userMessage, input.history);
    await updateSessionState(deps.prisma, input.session.id, { intent });
  }

  // 3. Ramificar por intent.
  switch (intent) {
    case "denuncia":
      return runDenunciaFlow(deps, input.session, state, input.userMessage, input.history);
    case "consulta":
      return runConsultaFlow(deps, input.userMessage);
    case "bounty_crear":
    case "bounty_reclamar":
      return {
        text: "Los bounties están disponibles en alivia.sbs/bounties. (Mockup en MVP — la creación end-to-end llega post-hackathon.)",
      };
    case "acta_subir":
      return {
        text: "El observatorio electoral está en alivia.sbs/elecciones. (Mockup en MVP.)",
      };
    default:
      return {
        text: "Recibo pistas ciudadanas de corrupción y respondo consultas sobre personas, cargos o empresas. ¿En qué te ayudo?",
      };
  }
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
// Flujo: CONSULTA
// =============================================================================

async function runConsultaFlow(
  deps: AgentDeps,
  userMessage: string,
): Promise<AgentTurnOutput> {
  const nameMatch = userMessage.match(/quien es ([^?\.]+)|qué sabes de ([^?\.]+)|sobre ([^?\.]+)/i);
  const name = (nameMatch?.[1] ?? nameMatch?.[2] ?? nameMatch?.[3] ?? userMessage).trim();

  const candidates = await findMatchingEntities(deps.prisma, [name]);
  if (candidates.length === 0) {
    return {
      text: `No tengo registros sobre "${name}". Si tienes información, puedes ser quien aporte el primer reporte.`,
    };
  }

  const dossier = await getDossier(deps.prisma, candidates[0].id);
  const edgeSummary = dossier?.outgoingEdges
    .concat(dossier.incomingEdges)
    .slice(0, 5)
    .map((e) => `  · ${e.type} (confianza ${e.confidence.toFixed(2)})`)
    .join("\n");

  return {
    text:
      `Dossier de ${candidates[0].label} (${candidates[0].type}):\n` +
      (edgeSummary ?? "  · sin vínculos registrados") +
      `\nCasos asociados: ${dossier?.cases.length ?? 0}.`,
  };
}

// Re-export for ergonomic use in tools.ts / tests
export { normalizeLabel };
