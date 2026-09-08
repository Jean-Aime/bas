import type { IntentType } from '@/lib/types';
export type { IntentType };

export interface AIRequest {
  message: string;
  businessContext: BusinessContextData;
  conversationHistory: ConversationTurn[];
}

export interface BusinessContextData {
  businessId: string;
  businessName: string;
  description: string | null;
  currency: string;
  products: Array<{
    name: string;
    description: string | null;
    price: number;
    attributes: Record<string, string>;
    stock: number;
  }>;
  services: Array<{
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number | null;
  }>;
  faqs: Array<{ question: string; answer: string; is_published: boolean }>;
  policies: Array<{ title: string; content: string; category: string }>;
  hours: Array<{ day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }>;
  knowledgeDocuments: Array<{ title: string; content: string }>;
}

export interface ConversationTurn {
  role: 'customer' | 'assistant';
  content: string;
}

export interface AIResponse {
  intent: IntentType;
  confidence: number;
  reply: string;
  extractedEntities: Record<string, string>;
  shouldEscalate: boolean;
  escalateReason: string | null;
  actionType: 'none' | 'order' | 'booking' | 'request' | 'handover';
  actionData: Record<string, unknown>;
}

export interface AIProvider {
  detectIntent(message: string, context: BusinessContextData): Promise<{ intent: IntentType; confidence: number }>;
  generateResponse(request: AIRequest): Promise<AIResponse>;
}
