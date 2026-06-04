import type {
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMProvider,
} from "./provider";

/**
 * Provider determinístico para dev sin OPENAI_API_KEY y para tests.
 * NO usar en demo. Detecta el caso por keywords en el primer mensaje de
 * usuario y devuelve una respuesta estructurada plausible.
 *
 * Se activa cuando ALIVIA_LLM_MODE=mock (ver factory.ts).
 */
export class MockLLMProvider implements LLMProvider {
  readonly name = "mock/deterministic";

  async complete(req: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const lastUser = [...req.messages].reverse().find((m) => m.role === "user");
    const content = lastUser?.content.toLowerCase() ?? "";

    if (req.jsonMode) {
      return { content: this.mockJson(content), model: this.name };
    }
    return { content: this.mockText(content), model: this.name };
  }

  private mockJson(userText: string): string {
    if (userText.includes("intent") || userText.includes("clasifica")) {
      const intent = this.guessIntent(userText);
      return JSON.stringify({ intent });
    }
    if (userText.includes("extrae") || userText.includes("entidad")) {
      return JSON.stringify({
        people: [{ full_name: "Juan Pérez Quispe", role: "gerente" }],
        organizations: [{ legal_name: "Municipalidad Norte", sector: "publica" }],
        relations: [{ kind: "DESIGNO", from: "Juan Pérez Quispe", to: "Ana Pérez Quispe" }],
      });
    }
    return JSON.stringify({ ok: true, note: "mock response" });
  }

  private mockText(userText: string): string {
    if (userText.includes("denuncia") || userText.includes("reportar")) {
      return "Hola, soy Alivia. Cuéntame qué pasó: ¿de qué persona o entidad hablamos?";
    }
    if (userText.includes("quien es") || userText.includes("quién es")) {
      return "Voy a buscar en mi memoria. (mock: dossier no disponible sin LLM real)";
    }
    return "Recibí tu mensaje. (mock: respuesta no determinada sin LLM real)";
  }

  private guessIntent(text: string): string {
    if (text.includes("denuncia") || text.includes("nepot") || text.includes("licit"))
      return "denuncia";
    if (text.includes("quien es") || text.includes("quién es") || text.includes("sabes de"))
      return "consulta";
    if (text.includes("bounty") || text.includes("recompensa")) return "bounty_crear";
    if (text.includes("acta")) return "acta_subir";
    return "fuera_alcance";
  }
}
