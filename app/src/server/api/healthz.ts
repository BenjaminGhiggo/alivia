import type { Healthz } from "wasp/server/api";

/**
 * GET /healthz
 * Spec: 07.F3.6 / 06-demo-acceptance §5.
 */
export const healthz: Healthz = async (_req, res, _context) => {
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
