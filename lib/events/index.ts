export type EventType =
  | 'customer.created'
  | 'conversation.created'
  | 'message.received'
  | 'message.sent'
  | 'intent.detected'
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'order.created'
  | 'booking.created'
  | 'request.created'
  | 'integration.connected'
  | 'integration.disconnected'
  | 'handover.requested'
  | 'handover.completed';

export interface Event<T = unknown> {
  type: EventType;
  businessId: string;
  payload: T;
  timestamp: string;
}

export type EventHandler<T = unknown> = (event: Event<T>) => void | Promise<void>;

const handlers: Map<EventType, EventHandler[]> = new Map();

export function subscribe<T>(type: EventType, handler: EventHandler<T>): () => void {
  if (!handlers.has(type)) handlers.set(type, []);
  handlers.get(type)!.push(handler as EventHandler);
  return () => {
    const list = handlers.get(type);
    if (list) {
      const idx = list.indexOf(handler as EventHandler);
      if (idx >= 0) list.splice(idx, 1);
    }
  };
}

export async function emit<T>(type: EventType, businessId: string, payload: T): Promise<void> {
  const event: Event<T> = { type, businessId, payload, timestamp: new Date().toISOString() };
  const list = handlers.get(type);
  if (!list) return;
  await Promise.all(list.map((h) => Promise.resolve(h(event))));
}
