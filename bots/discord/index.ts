import {
  Client,
  Events,
  GatewayIntentBits,
  type Interaction,
  type Message,
} from "discord.js";

/**
 * Bot Discord · slash `/preguntar` + DMs.
 * Spec: 05-architecture §3.1.
 *
 * Vars de entorno:
 * - DISCORD_BOT_TOKEN
 * - DISCORD_CLIENT_ID
 * - DISCORD_GUILD_ID
 * - ALIVIA_API_URL
 * - ALIVIA_BOT_SHARED_SECRET
 *
 * Diseño: idéntico patrón al bot Telegram (sin estado local, todo via API).
 */

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const API_URL = process.env.ALIVIA_API_URL ?? "http://localhost:3001";
const BOT_SECRET = process.env.ALIVIA_BOT_SHARED_SECRET ?? "";

if (!TOKEN) {
  console.error("[bot:discord] DISCORD_BOT_TOKEN no está seteada en env.");
  process.exit(1);
}

interface AgentResponse {
  text: string;
  caseToMint?: { case_id: string };
}

async function callAgentTurn(externalUserId: string, message: string): Promise<AgentResponse> {
  const res = await fetch(`${API_URL}/api/agent/turn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(BOT_SECRET && { "X-Alivia-Bot-Token": BOT_SECRET }),
    },
    body: JSON.stringify({ channel: "discord", externalUserId, message }),
  });
  if (!res.ok) throw new Error(`agent_turn_${res.status}`);
  return res.json() as Promise<AgentResponse>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`[bot:discord] conectado como ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "preguntar") return;

  await interaction.deferReply();
  const query = interaction.options.getString("nombre", true);
  try {
    const result = await callAgentTurn(interaction.user.id, `¿quién es ${query}?`);
    await interaction.editReply(result.text);
  } catch (err) {
    console.error("[bot:discord] /preguntar error:", err);
    await interaction.editReply("Tuve un problema. Volvé a intentar en unos segundos.");
  }
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;
  // Sólo responde a DMs para no spamear servers
  if (message.guild) return;

  try {
    const result = await callAgentTurn(message.author.id, message.content);
    await message.reply(result.text);
    if (result.caseToMint) {
      await message.reply(`📡 Minteando NFT-Acta para ${result.caseToMint.case_id}...`);
    }
  } catch (err) {
    console.error("[bot:discord] DM error:", err);
    await message.reply("Tuve un problema procesando tu mensaje.");
  }
});

console.log(`[bot:discord] iniciando contra ${API_URL}...`);
client.login(TOKEN);
