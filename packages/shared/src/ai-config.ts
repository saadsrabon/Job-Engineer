import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_MODELS,
  DEFAULT_RESUME_PARSER_MAX_TOKENS,
  OPENROUTER_BASE_URL,
} from './constants';

export type AiProvider = 'openrouter' | 'custom';

export interface ResolvedAiConfig {
  provider: AiProvider;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  configured: boolean;
}

const AGENT_ENV_KEYS: Record<string, { model?: string; maxTokens?: string }> = {
  'resume-parser': {
    model: 'AI_MODEL_RESUME_PARSER',
    maxTokens: 'AI_MAX_TOKENS_RESUME_PARSER',
  },
  'cover-letter': {
    model: 'AI_MODEL_COVER_LETTER',
    maxTokens: 'AI_MAX_TOKENS_COVER_LETTER',
  },
  'job-analyzer': { model: 'AI_MODEL_JOB_ANALYZER', maxTokens: 'AI_MAX_TOKENS_JOB_ANALYZER' },
  'ats-scorer': { model: 'AI_MODEL_ATS_SCORER', maxTokens: 'AI_MAX_TOKENS_ATS_SCORER' },
  'interview-coach': {
    model: 'AI_MODEL_INTERVIEW_COACH',
    maxTokens: 'AI_MAX_TOKENS_INTERVIEW_COACH',
  },
  'email-writer': { model: 'AI_MODEL_EMAIL_WRITER', maxTokens: 'AI_MAX_TOKENS_EMAIL_WRITER' },
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

export function resolveAiProvider(value = process.env.AI_PROVIDER): AiProvider {
  return value === 'custom' ? 'custom' : 'openrouter';
}

export function resolveAiApiKey(): string {
  return process.env.AI_API_KEY?.trim() || process.env.OPENROUTER_API_KEY?.trim() || '';
}

export function resolveAiConfig(): ResolvedAiConfig {
  const provider = resolveAiProvider();
  const apiKey = resolveAiApiKey();
  const baseUrl =
    provider === 'custom'
      ? normalizeBaseUrl(process.env.AI_BASE_URL?.trim() || '')
      : OPENROUTER_BASE_URL;
  const defaultModel =
    process.env.AI_DEFAULT_MODEL?.trim() ||
    (provider === 'custom' ? 'auto' : 'openai/gpt-4.1-mini');

  return {
    provider,
    apiKey,
    baseUrl,
    defaultModel,
    configured: Boolean(apiKey && (provider === 'openrouter' || Boolean(baseUrl))),
  };
}

export function resolveAgentModel(agent?: string, explicitModel?: string): string | undefined {
  if (explicitModel?.trim()) return explicitModel.trim();

  if (agent) {
    const envKeys = AGENT_ENV_KEYS[agent];
    if (envKeys?.model && process.env[envKeys.model]?.trim()) {
      return process.env[envKeys.model]!.trim();
    }

    const config = resolveAiConfig();
    if (config.provider === 'custom') {
      return config.defaultModel;
    }

    if (agent === 'resume-parser' && process.env.OPENROUTER_RESUME_PARSER_MODEL?.trim()) {
      return process.env.OPENROUTER_RESUME_PARSER_MODEL.trim();
    }

    return DEFAULT_MODELS[agent];
  }

  return resolveAiConfig().defaultModel;
}

export function resolveAgentMaxTokens(agent?: string, explicitMaxTokens?: number): number {
  if (explicitMaxTokens && explicitMaxTokens > 0) return explicitMaxTokens;

  if (agent) {
    const envKeys = AGENT_ENV_KEYS[agent];
    if (envKeys?.maxTokens && process.env[envKeys.maxTokens]) {
      const parsed = parseInt(process.env[envKeys.maxTokens]!, 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    if (agent === 'resume-parser') {
      const legacy = process.env.OPENROUTER_RESUME_PARSER_MAX_TOKENS;
      if (legacy) {
        const parsed = parseInt(legacy, 10);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
      return DEFAULT_RESUME_PARSER_MAX_TOKENS;
    }

    if (agent && DEFAULT_MAX_TOKENS[agent]) {
      return DEFAULT_MAX_TOKENS[agent]!;
    }
  }

  return 4096;
}

export function assertAiConfigured(): ResolvedAiConfig {
  const config = resolveAiConfig();
  if (!config.apiKey) {
    throw new Error('AI_API_KEY is not configured. Set AI_API_KEY or OPENROUTER_API_KEY in .env');
  }
  if (config.provider === 'custom' && !config.baseUrl) {
    throw new Error('AI_BASE_URL is required when AI_PROVIDER=custom');
  }
  return config;
}

export function resolveResumeParserMaxTokens(envValue?: string): number {
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return resolveAgentMaxTokens('resume-parser');
}

export function resolveAiConfigPublic() {
  const config = resolveAiConfig();
  let baseUrlHost = config.baseUrl;
  try {
    baseUrlHost = new URL(config.baseUrl).host;
  } catch {
    // keep raw value
  }

  return {
    provider: config.provider,
    baseUrlHost,
    defaultModel: config.defaultModel,
    configured: config.configured,
  };
}
