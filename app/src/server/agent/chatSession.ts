import { createHash, randomBytes } from "node:crypto";
import type { ChatSession, PrismaClient } from "@prisma/client";

/**
 * Estado conversacional del agente persistido entre turnos (07.F2.6).
 * Spec: 05-architecture §3.3 — el estado se recupera por chat_session_id.
 *
 * Sin PII: el channelUserId guardado es un hash, nunca el id real de
 * Telegram/Discord (R2 + 05-architecture §8.6).
 */

export type Channel = "telegram" | "discord" | "web";

export interface ConversationState {
  intent: string | null;
  partialCase: Record<string, unknown>;
  turnCount: number;
}

const EMPTY_STATE: ConversationState = {
  intent: null,
  partialCase: {},
  turnCount: 0,
};

/** Hash determinístico del id externo + sal local, no reversible a PII. */
export function hashExternalId(externalId: string): string {
  const salt = process.env.ALIVIA_USER_HASH_SALT ?? "alivia-mvp-salt";
  return createHash("sha256").update(`${salt}:${externalId}`).digest("hex").slice(0, 32);
}

/** Genera pseudónimo aportante-XXXX (4 hex random). */
export function generatePseudonym(): string {
  return `aportante-${randomBytes(2).toString("hex")}`;
}

/**
 * Devuelve la sesión activa para (channel, channelUserId) o la crea con un
 * pseudónimo nuevo y estado vacío.
 */
export async function getOrCreateChatSession(
  prisma: PrismaClient,
  channel: Channel,
  rawExternalId: string,
): Promise<ChatSession> {
  const channelUserId = hashExternalId(rawExternalId);
  const existing = await prisma.chatSession.findUnique({
    where: { channel_channelUserId: { channel, channelUserId } },
  });
  if (existing) return existing;

  return prisma.chatSession.create({
    data: {
      channel,
      channelUserId,
      pseudonym: generatePseudonym(),
      state: EMPTY_STATE as object,
    },
  });
}

export async function updateSessionState(
  prisma: PrismaClient,
  sessionId: string,
  patch: Partial<ConversationState>,
): Promise<ChatSession> {
  const current = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!current) throw new Error(`ChatSession ${sessionId} no existe`);

  const nextState = { ...(current.state as object as ConversationState), ...patch };
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: { state: nextState as object },
  });
}

export function readState(session: ChatSession): ConversationState {
  return { ...EMPTY_STATE, ...(session.state as object as ConversationState) };
}
