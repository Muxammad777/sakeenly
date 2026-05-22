// Thin wrapper around the Anthropic SDK. We default to the model defined in
// the project brief (claude-opus-4-7) and centralize message-creation so future
// concerns (prompt caching, telemetry, budget guards) live in one place.

import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";
const DEFAULT_MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS ?? 1024);

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  _client = new Anthropic({ apiKey });
  return _client;
}

export function isClaudeConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export interface AskCompletionParams {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AskCompletionResult {
  text: string;
  model: string;
  stopReason: string | null;
  inputTokens: number;
  outputTokens: number;
}

export async function askClaude(params: AskCompletionParams): Promise<AskCompletionResult> {
  const model = params.model ?? DEFAULT_MODEL;
  const maxTokens = params.maxTokens ?? DEFAULT_MAX_TOKENS;
  const message = await client().messages.create({
    model,
    max_tokens: maxTokens,
    temperature: params.temperature ?? 0.2,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  const text = message.content
    .flatMap((b) => (b.type === "text" && "text" in b ? [b.text] : []))
    .join("\n");

  return {
    text,
    model: message.model,
    stopReason: message.stop_reason,
    inputTokens: message.usage?.input_tokens ?? 0,
    outputTokens: message.usage?.output_tokens ?? 0,
  };
}
