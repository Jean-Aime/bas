import { supabase } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/lib/types';

/**
 * Analytics service (client-side). All conversation/message aggregation for
 * the dashboard lives here so pages never query Supabase directly.
 */

export interface MessageVolumePoint {
  date: string;
  customer: number;
  assistant: number;
  total: number;
}

export interface CategorySlice {
  name: string;
  value: number;
}

export interface AnalyticsStats {
  totalMessages: number;
  aiMessages: number;
  customerMessages: number;
  conversations: number;
}

export interface AnalyticsSnapshot {
  stats: AnalyticsStats;
  volume: MessageVolumePoint[];
  intents: CategorySlice[];
  channels: CategorySlice[];
}

/** Trend delta helpers ------------------------------------------------- */

export interface TrendPoint {
  label: string;
  current: number;
  previous: number;
}

/** Percentage change between two totals; null when no baseline exists. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

/**
 * Volume of messages bucketed by calendar day, split by sender type.
 * Returns the last `days` days including empty ones, oldest first.
 */
function bucketByDay(
  messages: Array<Pick<Message, 'sender_type' | 'created_at'>>,
  days: number
): MessageVolumePoint[] {
  const buckets = new Map<string, MessageVolumePoint>();
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = fmt.format(d);
    buckets.set(key, { date: key, customer: 0, assistant: 0, total: 0 });
  }

  messages.forEach((m) => {
    const key = fmt.format(new Date(m.created_at));
    const bucket = buckets.get(key);
    if (!bucket) return;
    if (m.sender_type === 'customer') bucket.customer += 1;
    else if (m.sender_type === 'assistant') bucket.assistant += 1;
    bucket.total += 1;
  });

  return Array.from(buckets.values());
}

function countBy<T>(rows: T[], key: (row: T) => string): CategorySlice[] {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const k = key(row);
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export async function fetchAnalyticsSnapshot(businessId: string, days = 14): Promise<AnalyticsSnapshot> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const [msgsRes, convsRes] = await Promise.all([
    supabase
      .from('messages')
      .select('sender_type, intent, created_at')
      .eq('business_id', businessId)
      .gte('created_at', since),
    supabase
      .from('conversations')
      .select('channel, detected_intent')
      .eq('business_id', businessId),
  ]);

  const messages = (msgsRes.data || []) as Array<Pick<Message, 'sender_type' | 'created_at'>>;
  const conversations = (convsRes.data || []) as Array<Pick<Conversation, 'channel' | 'detected_intent'>>;

  const stats: AnalyticsStats = {
    totalMessages: messages.length,
    aiMessages: messages.filter((m) => m.sender_type === 'assistant').length,
    customerMessages: messages.filter((m) => m.sender_type === 'customer').length,
    conversations: conversations.length,
  };

  // Split the window in half for trend comparison.
  const halfMs = (days / 2) * 86_400_000;
  const cutoff = Date.now() - halfMs;
  const recent = messages.filter((m) => new Date(m.created_at).getTime() >= cutoff);
  const prior = messages.filter((m) => new Date(m.created_at).getTime() < cutoff);

  return {
    stats,
    volume: bucketByDay(messages, days),
    intents: countBy(conversations, (c) => c.detected_intent || 'general'),
    channels: countBy(conversations, (c) => c.channel || 'web_chat'),
    ...((percentChange(recent.length, prior.length) !== null || recent.length > 0
      ? { trend: { label: 'Messages', current: recent.length, previous: prior.length } }
      : {}) as object),
  } as AnalyticsSnapshot & { trend?: TrendPoint };
}

export async function fetchAutomationRate(businessId: string): Promise<{
  aiMessages: number;
  handovers: number;
  conversations: number;
  rate: number | null;
}> {
  const [aiRes, handoverRes, convRes] = await Promise.all([
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('sender_type', 'assistant'),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_handover', true),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId),
  ]);

  const aiMessages = aiRes.count || 0;
  const handovers = handoverRes.count || 0;
  const conversations = convRes.count || 0;
  const rate = conversations > 0 ? Math.min(100, Math.round(((conversations - handovers) / conversations) * 100)) : null;

  return { aiMessages, handovers, conversations, rate };
}
