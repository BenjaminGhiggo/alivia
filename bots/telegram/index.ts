import { Bot, type Context } from "grammy";

/**
 * @alivia_sbs_bot · Bot Telegram que reenvía mensajes al backend Wasp.
 * Spec: 05-architecture §3.1 + 03-use-cases caso 1.
 *
 * Comandos:
 * - /start, /help: bienvenida y guía.
 * - /contratos: lista los 4 contratos de Alivia con explorer.
 * - /caso <id>: trazabilidad on-chain de un Case.
 * - /verificar <txHash>: confirma una tx contra Tanenbaum.
 * - /trazabilidad: explica el modelo de auditoría completo.
 * - mensaje libre: pasa al agente Alivia (gpt-4o-mini).
 *
 * Trazabilidad:
 * - Cuando un aporte mintea (caseToMint en la respuesta del backend),
 *   el bot hace poll cada 20s a /api/case/:id/status y notifica al
 *   usuario con el txHash + link al explorer cuando el mint confirma.
 *   Sin guardar chatId en backend: el closure vive en el handler.
 *
 * Vars de entorno:
 * - TELEGRAM_BOT_TOKEN          (obligatorio)
 * - ALIVIA_API_URL              (default http://localhost:3001)
 * - ALIVIA_PUBLIC_API_URL       (default https://api.alivia.sbs)
 * - ALIVIA_BOT_SHARED_SECRET    (header X-Alivia-Bot-Token)
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.ALIVIA_API_URL ?? "http://localhost:3001";
const PUBLIC_API_URL = process.env.ALIVIA_PUBLIC_API_URL ?? "https://api.alivia.sbs";
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
    body: JSON.stringify({ channel: "telegram", externalUserId, message }),
  });
  if (!res.ok) throw new Error(`agent_turn_${res.status}: ${await res.text().catch(() => "")}`);
  return res.json() as Promise<AgentResponse>;
}

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${PUBLIC_API_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

const bot = new Bot(TOKEN);

// ============================================================================
// COMANDOS
// ============================================================================

bot.command("start", async (ctx: Context) => {
  await ctx.reply(
    "Hola. Soy *Alivia*.\n\n" +
      "Recibo pistas ciudadanas de corrupción y las convierto en una memoria " +
      "pública verificable en *Syscoin Tanenbaum* (blockchain testnet).\n\n" +
      "Puedo entrevistarte si querés reportar algo, o responderte si querés " +
      "saber qué sé sobre alguien.\n\n" +
      "*Comandos de trazabilidad:*\n" +
      "  /contratos — dirección de los 4 contratos\n" +
      "  /caso `<id>` — detalle on-chain de un aporte\n" +
      "  /verificar `<txHash>` — confirma una tx en blockchain\n" +
      "  /trazabilidad — cómo auditar Alivia end-to-end\n\n" +
      "¿En qué te ayudo?",
    { parse_mode: "Markdown" },
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "*Cómo usarme:*\n\n" +
      "🔹 *Reportar*: contame lo que sabés con el mayor detalle posible. " +
      "Cuando estés listo, escribí *publicar* y te confirmo antes de mintear el NFT.\n\n" +
      "🔹 *Consultar*: pregunta *¿quién es <nombre>?*\n\n" +
      "🔹 *Auditar blockchain*: /contratos /caso /verificar /trazabilidad\n\n" +
      "Tu identidad queda como seudónimo. Nunca pido nombre real.",
    { parse_mode: "Markdown" },
  );
});

bot.command("contratos", async (ctx) => {
  try {
    const data = await fetchPublic<{
      chain: { name: string; chainId: number; explorer: string };
      contracts: { name: string; role: string; address: string | null; explorerUrl: string | null }[];
    }>("/api/contracts");

    let msg = `*Contratos de Alivia*\n`;
    msg += `_Red:_ ${data.chain.name} (chainId ${data.chain.chainId})\n`;
    msg += `_Explorer:_ ${data.chain.explorer}\n\n`;
    for (const c of data.contracts) {
      msg += `*${c.name}*\n${c.role}\n`;
      if (c.address) {
        msg += `\`${c.address}\`\n`;
        if (c.explorerUrl) msg += `[ver en explorer](${c.explorerUrl})\n`;
      } else {
        msg += `_(no desplegado)_\n`;
      }
      msg += `\n`;
    }
    await ctx.reply(msg, {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    console.error("[bot:contratos]", err);
    await ctx.reply("No pude consultar los contratos ahora. Reintenta en un momento.");
  }
});

bot.command("caso", async (ctx) => {
  const arg = (ctx.match?.toString() ?? "").trim();
  if (!arg || !/^alv-\d{4}-\d{2}-\d{2}-\d{4}$/.test(arg)) {
    await ctx.reply(
      "Uso: `/caso alv-YYYY-MM-DD-NNNN`\n\nEjemplo: `/caso alv-2026-06-04-0001`",
      { parse_mode: "Markdown" },
    );
    return;
  }
  try {
    const data = await fetchPublic<any>(`/api/case/${arg}/status`);
    let msg = `*Caso ${data.caseId}*\n`;
    msg += `Tipo: ${data.caseType}\n`;
    msg += `Estado: ${data.status}\n`;
    msg += `Score de corroboración: ${data.corroborationScore.toFixed(2)}\n`;
    msg += `Aportante: \`${data.reporterPseudonym}\`\n`;
    msg += `\n[Ver en alivia.sbs](${data.caseUrl})\n\n`;
    if (data.nft) {
      msg += `*NFT-Acta on-chain*\n`;
      msg += `Token ID: ${data.nft.tokenId}\n`;
      if (data.nft.txHash) msg += `Tx: \`${data.nft.txHash}\`\n`;
      if (data.nft.explorerTx) msg += `[Ver tx en Tanenbaum](${data.nft.explorerTx})\n`;
      if (data.nft.explorerToken) msg += `[Ver NFT en explorer](${data.nft.explorerToken})\n`;
    } else {
      msg += `_NFT-Acta aún no minteado (caso en watchlist o mint pendiente)._`;
    }
    await ctx.reply(msg, {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true },
    });
  } catch {
    await ctx.reply("No encontré ese caso. Verifica el id.");
  }
});

bot.command("verificar", async (ctx) => {
  const arg = (ctx.match?.toString() ?? "").trim();
  if (!arg || !/^0x[a-fA-F0-9]{64}$/.test(arg)) {
    await ctx.reply(
      "Uso: `/verificar 0x<64 hex>`\n\nPégame una tx hash y la confirmo contra Tanenbaum.",
      { parse_mode: "Markdown" },
    );
    return;
  }
  try {
    const data = await fetchPublic<any>(`/api/verify/${arg}`);
    let msg = `*Tx ${arg.slice(0, 10)}…${arg.slice(-6)}*\n`;
    msg += `Existe on-chain: ${data.exists ? "✅" : "❌"}\n`;
    msg += `Confirmada: ${data.confirmed ? "✅" : "⏳ pendiente"}\n`;
    if (data.blockNumber) msg += `Block: ${data.blockNumber}\n`;
    if (data.status) msg += `Status: ${data.status}\n`;
    msg += `\nDe: \`${data.from}\`\n`;
    if (data.to) msg += `A: \`${data.to}\`\n`;
    if (data.contractDeployed) msg += `Contract creado: \`${data.contractDeployed}\`\n`;
    msg += `\n*Involucra contrato Alivia:* ${data.involvedAliviaContract ? "✅ sí" : "no"}\n`;
    msg += `\n[Ver en explorer](${data.explorerUrl})`;
    await ctx.reply(msg, {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true },
    });
  } catch {
    await ctx.reply("Esa tx no existe en Tanenbaum.");
  }
});

bot.command("trazabilidad", async (ctx) => {
  await ctx.reply(
    "*Cómo auditar Alivia end-to-end*\n\n" +
      "Cada acción ciudadana queda en 3 capas:\n\n" +
      "1️⃣ *Base de datos pública*\n" +
      "Cada Case tiene id, hash de evidencia, score y aportante seudónimo. " +
      "Visible en alivia.sbs/casos\n\n" +
      "2️⃣ *Blockchain (Syscoin Tanenbaum)*\n" +
      "Cada aporte publicado se sella como NFT-Acta con timestamp y hash " +
      "inmutable. Los 4 contratos son públicos (usá /contratos).\n\n" +
      "3️⃣ *Repo abierto MIT*\n" +
      "github.com/BenjaminGhiggo/alivia\n\n" +
      "*Cómo verificarlo vos mismo:*\n" +
      "• /contratos — ves todas las direcciones\n" +
      "• /caso `<id>` — ves cualquier caso publicado\n" +
      "• /verificar `<txHash>` — confirmás que un hash es real\n" +
      "• Cualquier hash que Alivia te entregue se puede pegar en tanenbaum.io\n\n" +
      "_La corrupción solo se sostiene en el olvido._",
    { parse_mode: "Markdown", link_preview_options: { is_disabled: true } },
  );
});

// ============================================================================
// MENSAJES LIBRES → AGENTE + POLL POST-MINT
// ============================================================================

bot.on("message:text", async (ctx) => {
  const userText = ctx.message.text;
  if (userText.startsWith("/")) return; // comando ya manejado arriba

  const externalUserId = String(ctx.from?.id ?? "anonymous");

  try {
    const result = await callAgentTurn(externalUserId, userText);
    await ctx.reply(result.text);

    if (result.caseToMint) {
      const caseId = result.caseToMint.case_id;
      await ctx.reply(
        `📡 Minteando *NFT-Acta* para \`${caseId}\` en Syscoin Tanenbaum...\n` +
          `Te aviso con el hash de la tx en cuanto confirme.\n\n` +
          `Mientras tanto podés verificar con \`/caso ${caseId}\``,
        { parse_mode: "Markdown" },
      );
      pollCaseMint(ctx, caseId).catch((err) =>
        console.error("[bot:poll]", caseId, err),
      );
    }
  } catch (err) {
    console.error("[bot:telegram] error:", err);
    await ctx.reply("Tuve un problema procesando tu mensaje. Volvé a intentar en unos segundos.");
  }
});

/**
 * Polea status del caso hasta que el NFT-Acta confirme on-chain o
 * se vence el timeout (5 min). Sin estado en backend.
 */
async function pollCaseMint(ctx: Context, caseId: string): Promise<void> {
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 20_000));
    try {
      const data = await fetchPublic<any>(`/api/case/${caseId}/status`);
      if (data.nft && data.nft.txHash) {
        await ctx.reply(
          `✅ *NFT-Acta confirmado on-chain*\n\n` +
            `Caso: \`${caseId}\`\n` +
            `Token ID: ${data.nft.tokenId}\n` +
            `Tx: \`${data.nft.txHash}\`\n\n` +
            `🔗 [Ver tx en Tanenbaum](${data.nft.explorerTx})\n` +
            `🔗 [Ver NFT](${data.nft.explorerToken})\n\n` +
            `Cualquiera puede verificar este hash con /verificar.`,
          { parse_mode: "Markdown", link_preview_options: { is_disabled: true } },
        );
        return;
      }
    } catch {
      // RPC intermitente, ignorar
    }
  }
  await ctx.reply(
    `⌛ El mint de \`${caseId}\` aún no confirma (Tanenbaum suele tardar). ` +
      `Reintentá más tarde con \`/caso ${caseId}\``,
    { parse_mode: "Markdown" },
  );
}

console.log(`[bot:telegram] iniciando @alivia_sbs_bot contra ${API_URL}...`);
bot.start({
  onStart: (info) => console.log(`[bot:telegram] conectado como @${info.username}`),
});
