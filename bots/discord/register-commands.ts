import { REST, Routes, SlashCommandBuilder } from "discord.js";

/**
 * One-shot: registra los slash commands en el servidor de demo.
 * Correr con: tsx register-commands.ts
 * Requiere DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID en env.
 */

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("Faltan env: DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID.");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("preguntar")
    .setDescription("Consulta el grafo de Alivia sobre una persona o entidad")
    .addStringOption((option) =>
      option.setName("nombre").setDescription("Nombre a buscar").setRequired(true),
    )
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  console.log("[discord] registrando slash commands...");
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: commands,
  });
  console.log("[discord] commands registrados ✓");
})();
