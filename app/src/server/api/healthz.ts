import type { Request, Response } from "express";

/**
 * GET /healthz
 * Smoke endpoint para 07.F3.6 / 06-demo-acceptance §5.
 * Devuelve OK si el server responde. No verifica bots ni RPC zkSYS (lo hace
 * scripts/smoke.sh por separado, F7.1).
 */
export const healthz = async (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "alivia-server",
    timestamp: new Date().toISOString(),
    env: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasBotSharedSecret: !!process.env.ALIVIA_BOT_SHARED_SECRET,
      llmMode: process.env.ALIVIA_LLM_MODE ?? "auto",
    },
  });
};
