import {
  assertAiConfigured,
  resolveAgentMaxTokens,
  resolveAgentModel,
  resolveAiConfig,
  type AiProvider,
} from './ai-config';

/** Limit in-flight AI requests per process (gateway default limit is often 20). */
class AiRequestLimiter {
  private active = 0;
  private queue: Array<() => void> = [];

  constructor(private maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      this.queue.shift()?.();
    }
  }
}

function resolveAiMaxConcurrency(): number {
  const parsed = parseInt(process.env.AI_MAX_CONCURRENCY ?? '8', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8;
}

const aiRequestLimiter = new AiRequestLimiter(resolveAiMaxConcurrency());

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(status: number, detail: string): boolean {
  return (
    status === 429 ||
    /concurrency|rate.?limit|rate_limited/i.test(detail)
  );
}

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiChatClientOptions {
  apiKey?: string;
  baseUrl?: string;
  provider?: AiProvider;
  model?: string;
  agent?: string;
  temperature?: number;
  maxTokens?: number;
}

type AiCompletionMessage = {
  content?: string | null;
  reasoning?: string | null;
  reasoning_content?: string | null;
};

export interface AiChatOptions {
  jsonMode?: boolean;
  allowReasoningFallback?: boolean;
  maxTokens?: number;
}

export class AiChatClient {
  private config = resolveAiConfig();

  constructor(private options: AiChatClientOptions = {}) {}

  async chat(messages: AiChatMessage[], options: AiChatOptions = {}): Promise<string> {
    const result = await this.chatCompletion(messages, options);
    return result.text;
  }

  private async chatCompletion(
    messages: AiChatMessage[],
    options: AiChatOptions = {},
  ): Promise<{ text: string; finishReason?: string | null }> {
    const runtime = assertAiConfigured();
    const provider = this.options.provider ?? runtime.provider;
    const apiKey = this.options.apiKey ?? runtime.apiKey;
    const baseUrl = (this.options.baseUrl ?? runtime.baseUrl).replace(/\/$/, '');

    const model =
      resolveAgentModel(this.options.agent, this.options.model) ?? runtime.defaultModel;

    const maxTokens =
      options.maxTokens ??
      resolveAgentMaxTokens(this.options.agent, this.options.maxTokens);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://jobos.app';
      headers['X-Title'] = 'JobOS';
    }

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: this.options.temperature ?? 0.1,
      max_tokens: maxTokens,
    };

    if (options.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetchChatCompletion(baseUrl, headers, body, provider, maxTokens);

    const data = (await response.json()) as {
      choices: Array<{ message: AiCompletionMessage; finish_reason?: string | null }>;
    };

    const choice = data.choices[0];
    return {
      text: readAssistantText(choice?.message, options.allowReasoningFallback ?? false),
      finishReason: choice?.finish_reason ?? null,
    };
  }

  async extractJson<T>(messages: AiChatMessage[]): Promise<T> {
    const baseMaxTokens = resolveAgentMaxTokens(this.options.agent, this.options.maxTokens);
    const compactReminder: AiChatMessage = {
      role: 'user',
      content:
        'Return ONLY compact valid JSON matching the schema. No markdown fences. Max 5 items per array. Keep text fields brief.',
    };

    let lastError: Error | null = null;

    for (let round = 0; round < 3; round++) {
      if (round > 0) {
        await sleep(1500);
      }

      const attemptMessages = round === 0 ? messages : [...messages, compactReminder];
      const maxTokens = Math.min(baseMaxTokens * 2 ** round, 8192);

      for (const jsonMode of [true, false] as const) {
        try {
          const { text, finishReason } = await this.chatCompletion(attemptMessages, {
            jsonMode,
            allowReasoningFallback: true,
            maxTokens,
          });
          return parseJsonFromAssistantText<T>(text, finishReason);
        } catch (error) {
          if (jsonMode && isUnsupportedJsonModeError(error)) {
            continue;
          }

          lastError = error instanceof Error ? error : new Error('No JSON found in AI response');
          if (lastError.message.includes('rate limited')) {
            throw lastError;
          }

          const retryable =
            lastError.message.includes('truncated') ||
            lastError.message.includes('empty response') ||
            lastError.message.includes('No JSON found');

          if (!retryable) {
            throw lastError;
          }
        }
      }
    }

    throw lastError ?? new Error('No JSON found in AI response');
  }
}

/** Backward-compatible alias */
export const OpenRouterClient = AiChatClient;

export type OpenRouterMessage = AiChatMessage;
export type OpenRouterOptions = AiChatClientOptions;

export function createAiClient(options: AiChatClientOptions = {}) {
  return new AiChatClient(options);
}

/** Reasoning models may leave `content` empty; only use reasoning fields for structured JSON. */
function readAssistantText(
  message?: AiCompletionMessage,
  allowReasoningFallback = false,
): string {
  const content = message?.content?.trim();
  if (content) return content;

  if (!allowReasoningFallback) return '';

  for (const field of [message?.reasoning_content, message?.reasoning]) {
    const text = field?.trim();
    if (text) return text;
  }

  return '';
}

export function parseJsonFromAssistantText<T>(
  text: string,
  finishReason?: string | null,
): T {
  if (!text.trim()) {
    throw new Error('AI returned an empty response');
  }

  const candidates = collectJsonCandidates(text);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      const repaired = repairTruncatedJson(candidate);
      if (repaired) {
        try {
          return JSON.parse(repaired) as T;
        } catch {
          // try next candidate
        }
      }
    }
  }

  if (finishReason === 'length') {
    throw new Error(
      'AI JSON response was truncated. Retry in a few seconds or increase AI_MAX_TOKENS_* in .env',
    );
  }

  throw new Error('No JSON found in AI response');
}

function collectJsonCandidates(text: string): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];

  const add = (value?: string | null) => {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    candidates.push(trimmed);
  };

  for (const block of text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) {
    add(block[1]);
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  add(objectMatch?.[0]);

  add(text.trim());

  return candidates;
}

function repairTruncatedJson(text: string): string | null {
  const start = text.indexOf('{');
  if (start < 0) return null;

  let slice = text.slice(start).trim();
  slice = slice.replace(/,\s*"[^"]*":\s*"[^"]*$/s, '');
  slice = slice.replace(/,\s*"[^"]*":\s*[^,\}\]]*$/s, '');
  slice = slice.replace(/,\s*$/s, '');

  const openBraces = (slice.match(/\{/g) ?? []).length;
  const closeBraces = (slice.match(/\}/g) ?? []).length;
  const openBrackets = (slice.match(/\[/g) ?? []).length;
  const closeBrackets = (slice.match(/\]/g) ?? []).length;

  slice += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
  slice += '}'.repeat(Math.max(0, openBraces - closeBraces));

  return slice;
}

function isUnsupportedJsonModeError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('response_format') ||
    message.includes('json_object') ||
    (message.includes('400') && message.includes('unsupported'))
  );
}

async function fetchChatCompletion(
  baseUrl: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  provider: AiProvider,
  maxTokens: number,
): Promise<Response> {
  const backoffMs = [1000, 2000, 3000, 5000, 8000];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= backoffMs.length; attempt++) {
    const response = await aiRequestLimiter.run(() =>
      fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }),
    );

    if (response.ok) {
      return response;
    }

    const errorText = await response.text();
    let detail = errorText;
    try {
      const parsed = JSON.parse(errorText) as {
        error?: { message?: string };
        message?: string;
      };
      detail = parsed.error?.message ?? parsed.message ?? errorText;
    } catch {
      // keep raw body
    }

    lastError = new Error(formatAiError(provider, response.status, errorText, maxTokens));

    if (isRateLimitError(response.status, detail) && attempt < backoffMs.length) {
      await sleep(backoffMs[attempt]!);
      continue;
    }

    throw lastError;
  }

  throw lastError ?? new Error('AI request failed');
}

function formatAiError(
  provider: AiProvider,
  status: number,
  body: string,
  maxTokens: number,
): string {
  let detail = body;
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; code?: number };
      message?: string;
    };
    detail = parsed.error?.message ?? parsed.message ?? body;
  } catch {
    // keep raw body
  }

  const label = provider === 'custom' ? 'AI gateway' : 'OpenRouter';

  if (status === 402) {
    return (
      `${label} credits insufficient (402): ${detail}. ` +
      (provider === 'custom'
        ? `Add credits to your gateway account or lower max_tokens (currently ${maxTokens}).`
        : `Try adding credits at https://openrouter.ai/settings/credits, or use a cheaper model / lower max_tokens (currently ${maxTokens}).`)
    );
  }

  if (
    status === 429 ||
    /concurrency|rate.?limit|rate_limited/i.test(detail) ||
    (status === 400 && /concurrency|rate.?limit|rate_limited/i.test(detail))
  ) {
    return `${label} rate limited (${status}): ${detail}. Retry in a few seconds or reduce parallel AI requests.`;
  }

  if (status === 503 || /no available channel|unavailable.*model/i.test(detail)) {
    return (
      `${label} model unavailable (${status}): ${detail}. ` +
      `When using a custom gateway, set AI_DEFAULT_MODEL=auto or AI_MODEL_RESUME_PARSER to a model your gateway supports.`
    );
  }

  return `${label} error (${status}): ${detail}`;
}
