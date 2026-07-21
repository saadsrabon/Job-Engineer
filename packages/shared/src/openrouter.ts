import { DEFAULT_MODELS, OPENROUTER_BASE_URL } from './constants';

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
        max_tokens: this.options.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${error}`);
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
