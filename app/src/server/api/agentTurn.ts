import type { ChatSession } from "@prisma/client";
import type { AgentTurn } from "wasp/server/api";
import type { PrismaClient } from "@prisma/client";
import { runAgentTurn, type AgentTurnOutput } from "../agent/alivia";
import { getOrCreateChatSession, type Channel } from "../agent/chatSession";
import { getLLMProvider } from "../agent/llm/factory";
import { getMintActaService } from "../chain/mintActa";
import { buildActaMetadata, getIpfsService } from "../chain/ipfs";
import type { AporteCase } from "../agent/_schema";

/**
 * POST /api/agent/turn
 * Endpoint que los bots (Telegram/Discord) y el chat web (plan B5) llaman
 * para procesar un mensaje. Spec: 05-architecture §3.1.
 *
 * Auth: header X-Alivia-Bot-Token contra env ALIVIA_BOT_SHARED_SECRET.
 * Concurrencia: locks en memoria por chatSessionId.
 */

interface AgentTurnRequestBody {
  channel: Channel;
  externalUserId: string;
  message: string;
  history?: string[];
}

interface AgentTurnResponse {
  text: string;
  sessionId: string;
  pseudonym: string;
  caseToMint?: AgentTurnOutput["caseToMint"];
}

const locks = new Map<string, Promise<void>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  while (locks.has(key)) await locks.get(key);
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  locks.set(key, gate);
  try {
    return await fn();
  } finally {
    locks.delete(key);
    release();
  }
}

async function mintCaseInBackground(prisma: PrismaClient, aporte: AporteCase): Promise<void> {
  const ipfs = getIpfsService();
  const mintSvc = getMintActaService();

  const metadata = buildActaMetadata({
    caseId: aporte.case_id,
    caseType: aporte.case_type,
    subjectName: aporte.subject.name,
    evidenceHash: aporte.evidence_hash,
    reporterPseudonym: aporte.reporter_pseudonym,
    corroborationScore: aporte.corroboration_score,
    createdAt: aporte.created_at,
  });

  const tokenURI = await ipfs.uploadMetadata(metadata);
  const vault = (process.env.ALIVIA_VAULT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

  const result = await mintSvc.mint({
    to: vault,
    caseId: aporte.case_id,
    evidenceHash: aporte.evidence_hash as `0x${string}`,
    graphSnapshotRoot: aporte.evidence_hash as `0x${string}`,
    aportantePseudonym: aporte.reporter_pseudonym,
    tokenURI,
  });

  await prisma.case.update({
    where: { id: aporte.case_id },
    data: { nftTokenId: result.tokenId, nftTxHash: result.txHash },
  });

  console.log(`[mint] ${aporte.case_id} → token ${result.tokenId}, tx ${result.txHash}`);
}

function authorize(headerValue: string | string[] | undefined): boolean {
  const expected = process.env.ALIVIA_BOT_SHARED_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production"; // dev: permisivo
  return typeof headerValue === "string" && headerValue === expected;
}

function parseBody(body: unknown): AgentTurnRequestBody | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Partial<AgentTurnRequestBody>;
  if (!b.channel || !b.externalUserId || !b.message) return null;
  if (!["telegram", "discord", "web"].includes(b.channel)) return null;
  return {
    channel: b.channel,
    externalUserId: b.externalUserId,
    message: b.message,
    history: Array.isArray(b.history) ? b.history : undefined,
  };
}

/**
 * Construye un objeto que se comporta como PrismaClient para los helpers del
 * agente (graph/queries, mutations, chatSession). Wasp expone entidades vía
 * context.entities pero no el client completo — usamos los delegates por
 * nombre lowercase como hace Prisma.
 */
function entitiesAsPrisma(entities: any): PrismaClient {
  return {
    node: entities.Node,
    edge: entities.Edge,
    case: entities.Case,
    contributor: entities.Contributor,
    evidence: entities.Evidence,
    chatSession: entities.ChatSession,
  } as unknown as PrismaClient;
}

export const agentTurn: AgentTurn = async (req, res, context) => {
  if (!authorize(req.header("X-Alivia-Bot-Token"))) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const input = parseBody(req.body);
  if (!input) {
    res.status(400).json({ error: "invalid body — expected {channel, externalUserId, message}" });
    return;
  }

  const prisma = entitiesAsPrisma(context.entities);

  try {
    const session: ChatSession = await getOrCreateChatSession(prisma, input.channel, input.externalUserId);

    const deps = { prisma, llm: getLLMProvider() };
    const result = await withLock(session.id, () =>
      runAgentTurn(deps, {
        session,
        userMessage: input.message,
        history: input.history,
      }),
    );

    if (result.caseToMint) {
      mintCaseInBackground(prisma, result.caseToMint).catch((err) => {
        console.error("[agentTurn] mint background error:", err);
      });
    }

    const response: AgentTurnResponse = {
      text: result.text,
      sessionId: session.id,
      pseudonym: session.pseudonym,
      caseToMint: result.caseToMint,
    };
    res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[agentTurn] error:", message);
    res.status(500).json({ error: "agent_failure", detail: message });
  }
};
