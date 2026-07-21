import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_MODELS,
  DEFAULT_RESUME_PARSER_MAX_TOKENS,
  OPENROUTER_BASE_URL,
} from './constants';

export function resolveResumeParserMaxTokens(envValue?: string): number {
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_RESUME_PARSER_MAX_TOKENS;
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterOptions {
  apiKey: string;
  model?: string;
  agent?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenRouterClient {
  constructor(private options: OpenRouterOptions) {}

  async chat(messages: OpenRouterMessage[]): Promise<string> {
    const model =
      this.options.model ||
      (this.options.agent ? DEFAULT_MODELS[this.options.agent] : undefined) ||
      'openai/gpt-4.1-mini';

    const maxTokens =
      this.options.maxTokens ??
      (this.options.agent ? DEFAULT_MAX_TOKENS[this.options.agent] : undefined) ??
      4096;

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jobos.app',
        'X-Title': 'JobOS',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: this.options.temperature ?? 0.1,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(formatOpenRouterError(response.status, error, maxTokens));
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return data.choices[0]?.message.content ?? '';
  }

  async extractJson<T>(messages: OpenRouterMessage[]): Promise<T> {
    const content = await this.chat(messages);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    return JSON.parse(jsonMatch[0]) as T;
  }
}

function formatOpenRouterError(
  status: number,
  body: string,
  maxTokens: number,
): string {
  let detail = body;
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; code?: number };
    };
    detail = parsed.error?.message ?? body;
  } catch {
    // keep raw body
  }

  if (status === 402) {
    return (
      `OpenRouter credits insufficient (402): ${detail}. ` +
      `Try adding credits at https://openrouter.ai/settings/credits, ` +
      `or use a cheaper model / lower max_tokens (currently ${maxTokens}).`
    );
  }

  return `OpenRouter error (${status}): ${detail}`;
}
