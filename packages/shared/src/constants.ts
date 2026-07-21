export const QUEUE_NAMES = {
  RESUME_PARSE: 'resume-parse',
  HEALTH_CHECK: 'health-check',
} as const;

export const API_VERSION = 'v1';

export const DEFAULT_PAGE_SIZE = 20;

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const DEFAULT_MODELS: Record<string, string> = {
  'resume-parser': 'openai/gpt-4.1-mini',
  'cover-letter': 'anthropic/claude-3.5-sonnet',
  'job-analyzer': 'openai/gpt-4.1-mini',
  'ats-scorer': 'openai/gpt-4.1-mini',
  'interview-coach': 'anthropic/claude-3.5-sonnet',
  'email-writer': 'openai/gpt-4.1-mini',
  'answer-generator': 'anthropic/claude-3.5-sonnet',
  'profile-improver': 'openai/gpt-4.1-mini',
  'skill-gap-analyzer': 'openai/gpt-4.1-mini',
  'career-advisor': 'anthropic/claude-3.5-sonnet',
};

export * from './api-client';
export * from './openrouter';
