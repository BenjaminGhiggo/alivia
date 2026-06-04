import type { Request, Response } from "express";
import type { ChatSession, PrismaClient } from "@prisma/client";
import { runAgentTurn, type AgentDeps, type AgentTurnOutput } from "../agent/alivia";
import { getOrCreateChatSession, type Channel } from "../agent/chatSession";
import { getLLMProvider } from "../agent/llm/factory";

/**
 * POST /api/agent/turn
 * Endpoint que los bots (Telegram/Discord) y el chat web (plan B5) llaman
 * para procesar un mensaje. Spec: 05-architecture §3.1.
 *
 * Auth: header X-Alivia-Bot-Token contra env ALIVIA_BOT_SHARED_SECRET.
 * Concurrencia: locks en memoria por chatSessionId (un turno por sesión a la vez).
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

function authorize(req: Request): boolean {
  const expected = process.env.ALIVIA_BOT_SHARED_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production"; // dev: permisivo
  return req.header("X-Alivia-Bot-Token") === expected;
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

export const agentTurn = async (req: Request, res: Response, context: { entities: { ChatSession: any }; prisma?: PrismaClient }) => {
  if (!authorize(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const input = parseBody(req.body);
  if (!input) {
    return res.status(400).json({ error: "invalid body — expected {channel, externalUserId, message}" });
  }

  // Wasp inyecta entidades en context; el client de Prisma vive en context.entities[...].$prisma
  const prisma: PrismaClient = (context as any).entities.ChatSession.$prisma ?? (context as any).prisma;

  try {
    const session: ChatSession = await getOrCreateChatSession(prisma, input.channel, input.externalUserId);

    const deps: AgentDeps = { prisma, llm: getLLMProvider() };
    const result = await withLock(session.id, () =>
      runAgentTurn(deps, {
        session,
        userMessage: input.message,
        history: input.history,
      }),
    );

    const response: AgentTurnResponse = {
      text: result.text,
      sessionId: session.id,
      pseudonym: session.pseudonym,
      caseToMint: result.caseToMint,
    };
    return res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[agentTurn] error:", message);
    return res.status(500).json({ error: "agent_failure", detail: message });
  }
};
