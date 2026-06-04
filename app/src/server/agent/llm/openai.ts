import OpenAI from "openai";
import type {
  LLMCompletionRequest,
  LLMCompletionResponse,
  LLMProvider,
} from "./provider";
import { LLMError } from "./provider";

/**
 * Implementación de LLMProvider sobre OpenAI gpt-4o-mini.
 * Spec: 05-architecture §1 (modelo único de MVP).
 *
 * El SDK leerá OPENAI_API_KEY del env. Si falta, el constructor falla rápido.
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = "openai/gpt-4o-mini";
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string = process.env.OPENAI_API_KEY ?? "", model?: string) {
    if (!apiKey) {
      throw new LLMError("OPENAI_API_KEY no está seteada en env", false);
    }
    this.client = new OpenAI({ apiKey });
    this.model = model ?? process.env.OPENAI_MODEL_AGENT ?? "gpt-4o-mini";
  }

  async complete(req: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: req.temperature ?? 0.3,
        max_tokens: req.maxTokens ?? 800,
        response_format: req.jsonMode ? { type: "json_object" } : undefined,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new LLMError("OpenAI devolvió respuesta vacía");
      }

      return { content, model: response.model };
    } catch (err) {
      if (err instanceof LLMError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      throw new LLMError(`OpenAI error: ${message}`);
    }
  }
}
