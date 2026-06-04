import type { LLMProvider } from "./provider";
import { OpenAIProvider } from "./openai";
import { MockLLMProvider } from "./mock";

/**
 * Selector de LLMProvider según env.
 * - ALIVIA_LLM_MODE=mock → MockLLMProvider (dev/tests, sin red).
 * - default (o "openai") → OpenAIProvider con OPENAI_API_KEY.
 *
 * Falla rápido si openai está pedido pero la key falta — preferimos error
 * temprano a un demo que muere en runtime.
 */
export function getLLMProvider(): LLMProvider {
  const mode = process.env.ALIVIA_LLM_MODE ?? "openai";

  if (mode === "mock") return new MockLLMProvider();

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "[llm] OPENAI_API_KEY ausente. Fallback a MockLLMProvider. " +
        "Para usar gpt-4o-mini real, seteá OPENAI_API_KEY o ALIVIA_LLM_MODE=mock explícito.",
    );
    return new MockLLMProvider();
  }

  return new OpenAIProvider();
}
