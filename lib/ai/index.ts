import type { AIProvider, AIRequest, AIResponse, BusinessContextData } from './provider';
import { LocalAIProvider } from './local-provider';

let currentProvider: AIProvider = new LocalAIProvider();

export function setAIProvider(provider: AIProvider) {
  currentProvider = provider;
}

export function getAIProvider(): AIProvider {
  return currentProvider;
}

export async function processMessage(request: AIRequest): Promise<AIResponse> {
  return currentProvider.generateResponse(request);
}

export type { AIProvider, AIRequest, AIResponse, BusinessContextData };
