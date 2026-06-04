import type { LLMProvider } from "./llm/provider";

/**
 * Router de intención. Clasifica el mensaje del usuario en una de las
 * categorías que el agente sabe manejar. Spec: 05-architecture §3.2.
 *
 * Output forzado a JSON. Cuando el LLM responde mal, default a `fuera_alcance`
 * (R5: si no estamos seguros, lo decimos — no inventamos un intent).
 */

export type Intent =
  | "denuncia"
  | "consulta"
  | "bounty_crear"
  | "bounty_reclamar"
  | "acta_subir"
  | "fuera_alcance";

const VALID_INTENTS: ReadonlySet<Intent> = new Set([
  "denuncia",
  "consulta",
  "bounty_crear",
  "bounty_reclamar",
  "acta_subir",
  "fuera_alcance",
]);

const SYSTEM = `Sos el clasificador de intención de Alivia. Devolvés SOLO JSON con la forma {"intent": "..."}.

Los intents válidos son:
- denuncia: usuario quiere reportar un caso (nepotismo, licitación, electoral, otro).
- consulta: usuario pregunta sobre una persona/empresa ("¿quién es X?").
- bounty_crear: usuario quiere ofrecer recompensa por evidencia de un caso.
- bounty_reclamar: usuario aporta evidencia para reclamar un bounty existente.
- acta_subir: usuario quiere subir foto/datos de un acta electoral.
- fuera_alcance: cualquier otra cosa, o no se entiende.

Si tenés cualquier duda, devolvé fuera_alcance.`;

export async function classifyIntent(
  llm: LLMProvider,
  userMessage: string,
  historyTail: string[] = [],
): Promise<Intent> {
  const contextHistory = historyTail
    .slice(-3)
    .map((m, i) => `Turno previo ${i + 1}: ${m}`)
    .join("\n");

  const response = await llm.complete({
    messages: [
      { role: "system", content: SYSTEM },
      ...(contextHistory ? [{ role: "user" as const, content: contextHistory }] : []),
      { role: "user", content: userMessage },
    ],
    jsonMode: true,
    temperature: 0,
    maxTokens: 50,
  });

  try {
    const parsed = JSON.parse(response.content) as { intent?: string };
    const candidate = parsed.intent as Intent | undefined;
    if (candidate && VALID_INTENTS.has(candidate)) return candidate;
  } catch {
    // fallthrough
  }
  return "fuera_alcance";
}
