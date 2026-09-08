import type {
  AIProvider,
  AIRequest,
  AIResponse,
  BusinessContextData,
  IntentType,
} from './provider';

const INTENT_KEYWORDS: Record<IntentType, string[]> = {
  PRODUCT_INQUIRY: ['product', 'item', 'have', 'available', 'stock', 'size', 'color', 'colour', 'do you have', 'looking for'],
  SERVICE_INQUIRY: ['service', 'offer', 'do you do', 'can you', 'treatment'],
  PRICE_INQUIRY: ['price', 'cost', 'how much', 'rate', 'fee', 'charge', 'expensive'],
  ORDER: ['order', 'buy', 'purchase', 'get', 'want to order', 'place order'],
  BOOKING: ['book', 'booking', 'reserve', 'reservation', 'room'],
  APPOINTMENT: ['appointment', 'schedule', 'slot', 'available time', 'when can'],
  AVAILABILITY: ['available', 'availability', 'free', 'open', 'today', 'tomorrow', 'this week'],
  DELIVERY: ['delivery', 'deliver', 'shipping', 'ship', 'courier'],
  PAYMENT: ['payment', 'pay', 'card', 'cash', 'mobile money', 'momo', 'credit'],
  CANCELLATION: ['cancel', 'cancellation', 'cancel my'],
  RETURN: ['return', 'refund', 'exchange', 'money back'],
  COMPLAINT: ['complaint', 'complain', 'bad', 'terrible', 'awful', 'unhappy', 'angry', 'frustrated', 'worst', 'horrible', 'disappointed'],
  FAQ: ['question', 'how do', 'what is', 'where is', 'when do', 'can i', 'policy', 'policies', 'hours', 'open', 'close', 'location', 'address'],
  HUMAN_SUPPORT: ['human', 'agent', 'person', 'representative', 'speak to someone', 'talk to someone', 'real person'],
  GENERAL_INQUIRY: ['hello', 'hi', 'hey', 'help', 'info', 'information', 'about'],
};

function detectIntentFromMessage(message: string): { intent: IntentType; confidence: number } {
  const lower = message.toLowerCase();
  let bestIntent: IntentType = 'GENERAL_INQUIRY';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += kw.length > 4 ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as IntentType;
    }
  }

  const confidence = bestScore === 0 ? 0.3 : Math.min(0.95, 0.5 + bestScore * 0.15);
  return { intent: bestIntent, confidence };
}

function extractEntities(message: string): Record<string, string> {
  const entities: Record<string, string> = {};
  const lower = message.toLowerCase();

  const colorMatch = lower.match(/\b(black|white|red|blue|green|yellow|brown|gray|grey|pink|purple|orange|navy)\b/);
  if (colorMatch) entities.color = colorMatch[1];

  const sizeMatch = lower.match(/\bsize\s+(\d+)\b/) ?? lower.match(/\b(small|medium|large|xl|xxl)\b/);
  if (sizeMatch) entities.size = sizeMatch[1];

  const numberMatch = lower.match(/\b(\d+)\b/);
  if (numberMatch) entities.quantity = numberMatch[1];

  return entities;
}

function searchProducts(context: BusinessContextData, message: string): string[] {
  const lower = message.toLowerCase();
  const results: string[] = [];

  for (const p of context.products) {
    const nameMatch = lower.includes(p.name.toLowerCase().split(' ')[0]);
    const descMatch = p.description && lower.includes(p.description.toLowerCase().split(' ')[0]);
    if (nameMatch || descMatch) {
      const stock = p.stock > 0 ? `In stock (${p.stock} available)` : 'Currently out of stock';
      results.push(`${p.name} — ${context.currency} ${p.price}. ${stock}${p.description ? `. ${p.description}` : ''}`);
    }
  }

  return results;
}

function searchServices(context: BusinessContextData, message: string): string[] {
  const lower = message.toLowerCase();
  const results: string[] = [];

  for (const s of context.services) {
    if (lower.includes(s.name.toLowerCase()) || lower.includes(s.name.toLowerCase().split(' ')[0])) {
      const duration = s.duration_minutes ? ` (${s.duration_minutes} min)` : '';
      results.push(`${s.name} — ${context.currency} ${s.price}${duration}${s.description ? `. ${s.description}` : ''}`);
    }
  }

  return results;
}

function searchFAQs(context: BusinessContextData, message: string): string[] {
  const lower = message.toLowerCase();
  const results: string[] = [];

  for (const f of context.faqs) {
    const words = f.question.toLowerCase().split(/\s+/);
    const matches = words.filter((w) => w.length > 3 && lower.includes(w));
    if (matches.length >= 2) {
      results.push(`Q: ${f.question}\nA: ${f.answer}`);
    }
  }

  return results;
}

function searchPolicies(context: BusinessContextData, message: string): string[] {
  const lower = message.toLowerCase();
  const results: string[] = [];

  for (const p of context.policies) {
    if (lower.includes(p.title.toLowerCase()) || lower.includes(p.category.toLowerCase())) {
      results.push(`${p.title}: ${p.content}`);
    }
  }

  return results;
}

function searchKnowledge(context: BusinessContextData, message: string): string[] {
  const lower = message.toLowerCase();
  const results: string[] = [];

  for (const doc of context.knowledgeDocuments) {
    const words = lower.split(/\s+/).filter((w) => w.length > 3);
    const docLower = doc.content.toLowerCase();
    const matches = words.filter((w) => docLower.includes(w));
    if (matches.length >= 2) {
      results.push(doc.content.substring(0, 500));
    }
  }

  return results;
}

function formatHours(context: BusinessContextData): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const lines = context.hours
    .filter((h) => !h.is_closed)
    .map((h) => `${days[h.day_of_week]}: ${h.open_time} - ${h.close_time}`);
  return lines.length > 0 ? lines.join('\n') : 'Hours not configured.';
}

function shouldEscalate(intent: IntentType, confidence: number, message: string): { escalate: boolean; reason: string | null } {
  const lower = message.toLowerCase();
  if (intent === 'HUMAN_SUPPORT') return { escalate: true, reason: 'Customer requested human support' };
  if (intent === 'COMPLAINT') return { escalate: true, reason: 'Customer appears upset or is complaining' };
  if (confidence < 0.4) return { escalate: true, reason: 'Low confidence in intent detection' };
  return { escalate: false, reason: null };
}

function determineAction(intent: IntentType): AIResponse['actionType'] {
  switch (intent) {
    case 'ORDER': return 'order';
    case 'BOOKING':
    case 'APPOINTMENT': return 'booking';
    case 'COMPLAINT':
    case 'CANCELLATION':
    case 'RETURN':
    case 'HUMAN_SUPPORT': return 'handover';
    case 'PRODUCT_INQUIRY':
    case 'SERVICE_INQUIRY':
    case 'PRICE_INQUIRY':
    case 'AVAILABILITY': return 'request';
    default: return 'none';
  }
}

function buildReply(intent: IntentType, context: BusinessContextData, message: string, entities: Record<string, string>): string {
  switch (intent) {
    case 'PRODUCT_INQUIRY': {
      const results = searchProducts(context, message);
      if (results.length > 0) return `Here's what I found:\n\n${results.join('\n\n')}`;
      return `I couldn't find specific products matching your query. Could you tell me more about what you're looking for? Our products include: ${context.products.map((p) => p.name).join(', ')}.`;
    }
    case 'SERVICE_INQUIRY': {
      const results = searchServices(context, message);
      if (results.length > 0) return `Here are our services:\n\n${results.join('\n\n')}`;
      return `Here are the services we offer:\n${context.services.map((s) => `- ${s.name}: ${context.currency} ${s.price}`).join('\n')}`;
    }
    case 'PRICE_INQUIRY': {
      const products = searchProducts(context, message);
      const services = searchServices(context, message);
      if (products.length > 0) return products.join('\n\n');
      if (services.length > 0) return services.join('\n\n');
      return `I'd be happy to help with pricing. Are you asking about a specific product or service? We offer: ${context.products.map((p) => p.name).join(', ')}, and services like ${context.services.map((s) => s.name).join(', ')}.`;
    }
    case 'ORDER': {
      const results = searchProducts(context, message);
      if (results.length > 0) return `I found this for you:\n\n${results.join('\n\n')}\n\nWould you like to place an order? I can help you submit an order request and the ${context.businessName} team will follow up with you.`;
      return `I can help you place an order. What product are you interested in? Available products: ${context.products.map((p) => p.name).join(', ')}.`;
    }
    case 'BOOKING':
    case 'APPOINTMENT': {
      const services = searchServices(context, message);
      if (services.length > 0) return `${services.join('\n\n')}\n\nWould you like to book this? Please share your preferred date and time, and I'll submit a booking request for you.`;
      return `I can help you book an appointment. Our services include:\n${context.services.map((s) => `- ${s.name}: ${context.currency} ${s.price}`).join('\n')}\n\nWhich service would you like to book, and what date/time works for you?`;
    }
    case 'AVAILABILITY': {
      return `For real-time availability, I'd recommend submitting a booking request with your preferred date and time. The ${context.businessName} team will confirm availability and get back to you. Would you like to proceed?`;
    }
    case 'FAQ': {
      const faqResults = searchFAQs(context, message);
      if (faqResults.length > 0) return faqResults.join('\n\n');
      const policyResults = searchPolicies(context, message);
      if (policyResults.length > 0) return policyResults.join('\n\n');
      if (lower_(message, 'hours') || lower_(message, 'open')) return `Here are our hours:\n${formatHours(context)}`;
      return `I'd be happy to help. You can ask me about our products, services, pricing, hours, policies, or anything else about ${context.businessName}.`;
    }
    case 'COMPLAINT': {
      return `I'm sorry to hear you're having an issue. I'm connecting you with a team member from ${context.businessName} who can help resolve this right away.`;
    }
    case 'HUMAN_SUPPORT': {
      return `I'm connecting you with a team member from ${context.businessName}. They'll be with you shortly.`;
    }
    case 'DELIVERY': {
      const policyResults = searchPolicies(context, message);
      if (policyResults.length > 0) return policyResults.join('\n\n');
      return `For delivery information, please contact ${context.businessName} directly and our team will assist you.`;
    }
    case 'PAYMENT': {
      const policyResults = searchPolicies(context, message);
      if (policyResults.length > 0) return policyResults.join('\n\n');
      return `We accept various payment methods. For specific payment questions, our team can assist you.`;
    }
    case 'CANCELLATION': {
      return `For cancellations, I'm connecting you with the ${context.businessName} team who can process your request.`;
    }
    case 'RETURN': {
      const policyResults = searchPolicies(context, message);
      if (policyResults.length > 0) return policyResults.join('\n\n');
      return `For returns, please contact ${context.businessName} directly and our team will guide you through the process.`;
    }
    default: {
      const knowledge = searchKnowledge(context, message);
      if (knowledge.length > 0) return knowledge[0];
      return `Hello! I'm the ${context.businessName} assistant. I can help you with:\n• Product information and pricing\n• Services and bookings\n• Frequently asked questions\n• Business hours and policies\n\nWhat can I help you with today?`;
    }
  }
}

function lower_(msg: string, term: string): boolean {
  return msg.toLowerCase().includes(term);
}

export class LocalAIProvider implements AIProvider {
  async detectIntent(message: string, _context: BusinessContextData): Promise<{ intent: IntentType; confidence: number }> {
    return detectIntentFromMessage(message);
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const { intent, confidence } = detectIntentFromMessage(request.message);
    const entities = extractEntities(request.message);
    const escalation = shouldEscalate(intent, confidence, request.message);
    const actionType = determineAction(intent);
    const reply = buildReply(intent, request.businessContext, request.message, entities);

    return {
      intent,
      confidence,
      reply,
      extractedEntities: entities,
      shouldEscalate: escalation.escalate,
      escalateReason: escalation.reason,
      actionType: escalation.escalate ? 'handover' : actionType,
      actionData: {},
    };
  }
}
