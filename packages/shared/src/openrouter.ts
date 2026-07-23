export {
  AiChatClient,
  OpenRouterClient,
  createAiClient,
} from './ai-client';
export type {
  AiChatClientOptions,
  AiChatMessage,
  OpenRouterMessage,
  OpenRouterOptions,
} from './ai-client';

export {
  resolveAiConfig,
  resolveAiConfigPublic,
  resolveAiProvider,
  resolveAiApiKey,
  resolveAgentModel,
  resolveAgentMaxTokens,
  resolveResumeParserMaxTokens,
  assertAiConfigured,
} from './ai-config';
export type { AiProvider, ResolvedAiConfig } from './ai-config';
