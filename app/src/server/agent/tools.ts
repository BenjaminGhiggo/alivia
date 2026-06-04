import { createHash } from "node:crypto";
import type { Node, PrismaClient } from "@prisma/client";
import type { LLMProvider } from "./llm/provider";
import { computeCorroborationScore, isPublishable, type ScoreFactors } from "./_score";
import { findMatchingEntities, findNodesByLabel, getDossier } from "../graph/queries";
import { createEdge, upsertNode } from "../graph/mutations";
import { z } from "zod";
import { AporteCase, nextCaseId } from "./_schema";
import { computeAportanteLevel, getAportanteService } from "../chain/mintAportante";

/**
 * 6 tools que el agente expone como function-calls. Spec: 05-architecture §3.3.
 * Convención: cada función pura toma sus deps por arg (DI, testeable).
 *
 * mint_acta vive en F4 (chain/mintActa.ts) — acá sólo se referencia su firma.
 */

// =============================================================================
// Tool 1 — extract_entities
// =============================================================================

export interface ExtractedEntities {
  people: { full_name: string; role?: string }[];
  organizations: { legal_name: string; sector?: string; ruc?: string }[];
  relations: { kind: string; from: string; to: string }[];
}

const EXTRACT_SYSTEM = `Sos el extractor de entidades de Alivia. Devolvés SOLO JSON con la forma:
{
  "people": [{"full_name": "...", "role": "..."}],
  "organizations": [{"legal_name": "...", "sector": "publica|privada|mixta|ong", "ruc": "..."}],
  "relations": [{"kind": "DESIGNO|OCUPA_CARGO|ES_PARIENTE_DE|ES_DUENO_DE|GANO|MENCIONADO_EN", "from": "name", "to": "name"}]
}
Sólo incluye entidades mencionadas explícitamente. No inventes nombres ni cargos.`;

export async function extractEntities(
  llm: LLMProvider,
  rawText: string,
): Promise<ExtractedEntities> {
  const response = await llm.complete({
    messages: [
      { role: "system", content: EXTRACT_SYSTEM },
      { role: "user", content: rawText },
    ],
    jsonMode: true,
    temperature: 0.1,
  });
  try {
    return JSON.parse(response.content) as ExtractedEntities;
  } catch {
    return { people: [], organizations: [], relations: [] };
  }
}

// =============================================================================
// Tool 2 — query_graph
// =============================================================================

export async function queryGraph(
  prisma: PrismaClient,
  query: { name?: string; nodeId?: string },
): Promise<{ matches: Node[]; dossier?: Awaited<ReturnType<typeof getDossier>> }> {
  if (query.nodeId) {
    return { matches: [], dossier: await getDossier(prisma, query.nodeId) };
  }
  const matches = query.name ? await findNodesByLabel(prisma, query.name) : [];
  return { matches };
}

// =============================================================================
// Tool 3 — compute_corroboration_score (delegado)
// =============================================================================

export { computeCorroborationScore, isPublishable } from "./_score";
export type { ScoreFactors } from "./_score";

// =============================================================================
// Tool 4 — request_user_confirmation
// =============================================================================

export interface ConfirmationRequest {
  question: string;
  summary: string;
}

/** R10: el agente no actúa sin "sí, confirmo" textual del usuario. */
export function buildConfirmationRequest(summary: string): ConfirmationRequest {
  return {
    summary,
    question: "¿Confirmas que publique este aporte y mintee el NFT-Acta? Responde *sí, confirmo* o *no*.",
  };
}

const CONFIRM_TOKENS = /\b(sí|si|confirmo|adelante|publica|ok)\b/i;
const REJECT_TOKENS = /\b(no|cancela|para|detente)\b/i;

export function parseConfirmation(userReply: string): "confirm" | "reject" | "unclear" {
  const cleaned = userReply.toLowerCase().trim();
  if (REJECT_TOKENS.test(cleaned)) return "reject";
  if (CONFIRM_TOKENS.test(cleaned)) return "confirm";
  return "unclear";
}

// =============================================================================
// Tool 5 — persist_case
// =============================================================================

export interface PersistCaseInput {
  caseType: "nepotismo" | "licitacion" | "electoral" | "otro";
  subject: { name: string; role?: string; institution?: string };
  facts: string[];
  evidence: { type: string; value: string }[];
  reporterPseudonym: string;
  scoreFactors: ScoreFactors;
  extracted: ExtractedEntities;
}

/** Hash determinístico del bundle de evidencia para anclar en NFT-Acta. */
export function hashEvidenceBundle(input: Pick<PersistCaseInput, "facts" | "evidence">): string {
  const canonical = JSON.stringify({
    facts: [...input.facts].sort(),
    evidence: [...input.evidence].sort((a, b) => (a.value > b.value ? 1 : -1)),
  });
  return `0x${createHash("sha256").update(canonical).digest("hex")}`;
}

const SEQUENCE_PADDING_LENGTH = 4;

async function nextSequenceForToday(prisma: PrismaClient, date: Date): Promise<number> {
  const datePrefix = nextCaseId(date, 0).slice(0, "alv-YYYY-MM-DD".length);
  const count = await prisma.case.count({
    where: { id: { startsWith: datePrefix } },
  });
  return count + 1;
}

/**
 * Crea el Case + nodos + aristas + Contributor. R4: cruce contra grafo
 * antes de devolver, para enriquecer graph_connections.
 */
export async function persistCase(
  prisma: PrismaClient,
  input: PersistCaseInput,
  now: Date = new Date(),
): Promise<z.infer<typeof AporteCase>> {
  // 1. Resolver sujeto (upsert)
  const subjectNode = await upsertNode(prisma, {
    type: "PERSONA",
    label: input.subject.name,
    properties: {
      full_name: input.subject.name,
      role: input.subject.role,
      institution: input.subject.institution,
    },
    createdBy: input.reporterPseudonym,
  });

  // 2. R4: buscar coincidencias en el grafo
  const allNames = [
    input.subject.name,
    ...input.extracted.people.map((p) => p.full_name),
    ...input.extracted.organizations.map((o) => o.legal_name),
  ];
  const matches = await findMatchingEntities(prisma, allNames);
  const graphConnections = matches
    .filter((m) => m.id !== subjectNode.id)
    .map((m) => ({
      node_id: m.id,
      relation: "mencionado_en_aporte_relacionado",
      confidence: 0.6,
    }));

  // 3. Calcular score
  const score = computeCorroborationScore(input.scoreFactors);
  const evidenceHash = hashEvidenceBundle(input);

  // 4. Crear el Case
  const sequence = await nextSequenceForToday(prisma, now);
  const caseId = nextCaseId(now, sequence);
  const status = isPublishable(score) ? "published" : "watchlist";

  const created = await prisma.case.create({
    data: {
      id: caseId,
      caseType: input.caseType,
      subjectNodeId: subjectNode.id,
      facts: input.facts,
      evidence: input.evidence,
      graphConnections,
      corroborationScore: score,
      reporterPseudonym: input.reporterPseudonym,
      status,
      evidenceHash,
      publishedAt: status === "published" ? now : null,
    },
  });

  // 5. Upsert Contributor + contador
  await prisma.contributor.upsert({
    where: { pseudonym: input.reporterPseudonym },
    create: {
      pseudonym: input.reporterPseudonym,
      totalContributions: 1,
      lastSeenAt: now,
    },
    update: {
      totalContributions: { increment: 1 },
      lastSeenAt: now,
    },
  });

  // 6. Sembrar aristas desde las relaciones extraídas (best-effort)
  for (const rel of input.extracted.relations) {
    const [fromNode] = await findMatchingEntities(prisma, [rel.from]);
    const [toNode] = await findMatchingEntities(prisma, [rel.to]);
    if (!fromNode || !toNode) continue;
    try {
      await createEdge(prisma, {
        type: rel.kind as any,
        sourceNodeId: fromNode.id,
        targetNodeId: toNode.id,
        createdBy: input.reporterPseudonym,
        sourceCaseId: caseId,
      });
    } catch {
      // EdgeType inválido extraído por el LLM → skip
    }
  }

  // 7. Mint/update NFT-Aportante (fire-and-forget, sin bloquear la respuesta al
  //    usuario; lo dispara una promise sin await).
  triggerAportanteUpdateAsync(prisma, input.reporterPseudonym).catch((err) =>
    console.error("[aportante] background error:", err),
  );

  return AporteCase.parse({
    case_id: created.id,
    case_type: created.caseType,
    subject: input.subject,
    facts: input.facts,
    evidence: input.evidence,
    graph_connections: graphConnections,
    corroboration_score: score,
    reporter_pseudonym: input.reporterPseudonym,
    language_review_passed: true,
    created_at: created.createdAt.toISOString(),
    evidence_hash: evidenceHash,
    nft_token_id: null,
  });
}

/**
 * Garantiza que el aportante tenga su NFT-Aportante soulbound:
 * - Si no lo tiene, lo mintea con level 0 (Testigo).
 * - Si ya lo tiene, recalcula stats y level con los contadores frescos del
 *   Contributor en DB.
 *
 * Custodia: el NFT se mintea a la vault wallet de Alivia (post-MVP: claim
 * a wallet del aportante). El pseudónimo es el binding identifier.
 */
async function triggerAportanteUpdateAsync(
  prisma: PrismaClient,
  pseudonym: string,
): Promise<void> {
  const svc = getAportanteService();
  const contributor = await prisma.contributor.findUnique({ where: { pseudonym } });
  if (!contributor) return;

  const level = computeAportanteLevel(
    contributor.totalContributions,
    contributor.totalCorroborated,
  );
  const tokenURI = `https://alivia.sbs/aportantes/${pseudonym}/metadata.json`;

  // ensureMinted: si no existe, mint + asigna tokenId. Si ya existe, no-op.
  const result = await svc.ensureMinted({ pseudonym, tokenURI });

  // Si NO es nuevo, actualizamos stats en chain.
  if (!result.isNew && result.tokenId !== "0") {
    await svc.update({
      tokenId: BigInt(result.tokenId),
      level,
      totalContributions: contributor.totalContributions,
      totalCorroborated: contributor.totalCorroborated,
      tokenURI,
    });
  }

  // También guardamos el tokenId en DB para que la página /aportantes/:pseudonym
  // pueda mostrarlo sin re-consultar el chain.
  if (result.tokenId !== "0") {
    await prisma.contributor.update({
      where: { pseudonym },
      data: { soulboundTokenId: result.tokenId },
    });
  }
}
