/**
 * Interfaz LLMProvider. Cambiar de Claude/GPT/local debe ser un único
 * `new OtherProvider()` en el caller (Open/Closed).
 *
 * Spec: docs/specs/05-architecture.md §3.2-3.3.
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMCompletionRequest {
  messages: LLMMessage[];
  /** Si true, fuerza respuesta JSON parseable. */
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMCompletionResponse {
  content: string;
  /** Modelo concreto que respondió. Útil para logs/observabilidad. */
  model: string;
}

export interface LLMProvider {
  /** Identificador para logs. */
  readonly name: string;
  complete(req: LLMCompletionRequest): Promise<LLMCompletionResponse>;
}

/**
 * Error específico del proveedor LLM. El caller puede reaccionar
 * con reintento exponencial (ver 05-architecture §11).
 */
export class LLMError extends Error {
  constructor(message: string, public readonly retryable: boolean = true) {
    super(message);
    this.name = "LLMError";
  }
}
