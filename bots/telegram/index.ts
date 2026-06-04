import { Bot, type Context } from "grammy";

/**
 * @AliviaBot · Bot Telegram que reenvía mensajes al backend Wasp.
 * Spec: 05-architecture §3.1 + 03-use-cases caso 1.
 *
 * Vars de entorno:
 * - TELEGRAM_BOT_TOKEN          (obligatorio)
 * - ALIVIA_API_URL              (default http://localhost:3001)
 * - ALIVIA_BOT_SHARED_SECRET    (header X-Alivia-Bot-Token)
 *
 * Diseño:
 * - Sin estado local. Todo el estado vive en ChatSession en el server (R2).
 * - El bot sólo normaliza, llama a /api/agent/turn, devuelve el text al chat.
 * - Si la API devuelve caseToMint, el bot avisa que se va a mintear (el
 *   minteo real lo dispara el backend en F4).
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.ALIVIA_API_URL ?? "http://localhost:3001";
const BOT_SECRET = process.env.ALIVIA_BOT_SHARED_SECRET ?? "";

if (!TOKEN) {
  console.error("[bot:telegram] TELEGRAM_BOT_TOKEN no está seteada en env.");
  process.exit(1);
}

interface AgentResponse {
  text: string;
  sessionId: string;
  pseudonym: string;
  caseToMint?: { case_id: string; corroboration_score: number };
}

async function callAgentTurn(externalUserId: string, message: string): Promise<AgentResponse> {
  const res = await fetch(`${API_URL}/api/agent/turn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(BOT_SECRET && { "X-Alivia-Bot-Token": BOT_SECRET }),
    },
    body: JSON.stringify({
      channel: "telegram",
      externalUserId,
      message,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`agent_turn_${res.status}: ${detail}`);
  }
  return res.json() as Promise<AgentResponse>;
}

const bot = new Bot(TOKEN);

bot.command("start", async (ctx: Context) => {
  await ctx.reply(
    "Hola. Soy *Alivia*.\n\n" +
      "Recibo pistas ciudadanas de corrupción y las convierto en una memoria " +
      "pública verificable. Puedo entrevistarte si quieres reportar algo, o " +
      "responderte si quieres saber qué sé sobre alguien.\n\n" +
      "¿En qué te ayudo?",
    { parse_mode: "Markdown" },
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Cómo usarme:\n" +
      "- Para reportar: escribe lo que sabes con el mayor detalle posible.\n" +
      "  Cuando estés listo, escribe *publicar* y te confirmo antes de minar.\n" +
      "- Para consultar: pregunta *¿quién es <nombre>?*\n\n" +
      "Tu identidad queda como seudónimo. Nunca pido nombre real.",
    { parse_mode: "Markdown" },
  );
});

bot.on("message:text", async (ctx) => {
  const externalUserId = String(ctx.from?.id ?? "anonymous");
  const userText = ctx.message.text;

  try {
    const result = await callAgentTurn(externalUserId, userText);
    await ctx.reply(result.text);

    if (result.caseToMint) {
      await ctx.reply(
        `📡 Minteando NFT-Acta para ${result.caseToMint.case_id} en Syscoin... ` +
          `(te paso el hash en cuanto la tx confirme)`,
      );
    }
  } catch (err) {
    console.error("[bot:telegram] error:", err);
    await ctx.reply(
      "Tuve un problema procesando tu mensaje. Volvé a intentar en unos segundos.",
    );
  }
});

console.log(`[bot:telegram] iniciando @AliviaBot contra ${API_URL}...`);
bot.start({
  onStart: (botInfo) => console.log(`[bot:telegram] conectado como @${botInfo.username}`),
});
