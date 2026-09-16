import { supabase } from '@/lib/supabase/client';
import type { Notification } from '@/lib/types';

/**
 * Notifications service (client-side). Owns all reads/writes for the
 * notifications center so UI components stay free of query logic.
 */

export type NotificationType =
  | 'order'
  | 'booking'
  | 'request'
  | 'handover'
  | 'workflow'
  | 'integration'
  | 'knowledge'
  | 'system';

export const NOTIFICATION_TYPES: NotificationType[] = [
  'order', 'booking', 'request', 'handover', 'workflow', 'integration', 'knowledge', 'system',
];

/** UI metadata per notification type: label, tone, icon registry key. */
export const NOTIFICATION_TYPE_META: Record<NotificationType, { label: string; tone: 'primary' | 'success' | 'warning' | 'destructive' | 'info' }> = {
  order: { label: 'Orders', tone: 'primary' },
  booking: { label: 'Bookings', tone: 'success' },
  request: { label: 'Requests', tone: 'info' },
  handover: { label: 'Handovers', tone: 'warning' },
  workflow: { label: 'Workflows', tone: 'primary' },
  integration: { label: 'Integrations', tone: 'warning' },
  knowledge: { label: 'Knowledge', tone: 'info' },
  system: { label: 'System', tone: 'info' },
};

/** Fallback for unknown legacy type values stored in the column. */
export function normalizeType(raw: string): NotificationType {
  if (NOTIFICATION_TYPES.includes(raw as NotificationType)) return raw as NotificationType;
  return 'system';
}

export interface NotificationsPage {
  items: Notification[];
  unreadCount: number;
}

export async function fetchNotifications(
  businessId: string,
  userId: string,
  options: { limit?: number; unreadOnly?: boolean } = {}
): Promise<NotificationsPage> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 50);

  if (options.unreadOnly) query = query.eq('is_read', false);

  const { data } = await query;
  const items = (data || []) as Notification[];
  return { items, unreadCount: items.filter((n) => !n.is_read).length };
}

export async function fetchUnreadCount(businessId: string, userId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .eq('is_read', false);
  return count || 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead(businessId: string, userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .eq('is_read', false);
}

/* ---------------------------------------------------------------------- */
/* Grouping                                                                */
/* ---------------------------------------------------------------------- */

const DAY_MS = 86_400_000;

export type NotificationBucket = 'Today' | 'Yesterday' | 'This week' | 'Earlier';

function bucketFor(iso: string): NotificationBucket {
  const created = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const age = startOfToday.getTime() - created.getTime();

  if (created >= startOfToday) return 'Today';
  if (age < DAY_MS) return 'Yesterday';
  if (age < 6 * DAY_MS) return 'This week';
  return 'Earlier';
}

const BUCKET_ORDER: NotificationBucket[] = ['Today', 'Yesterday', 'This week', 'Earlier'];

export interface NotificationGroup {
  bucket: NotificationBucket;
  items: Notification[];
}

/** Time-grouped notification list, most recent first within each group. */
export function groupByTime(items: Notification[]): NotificationGroup[] {
  const groups = new Map<NotificationBucket, Notification[]>();
  items.forEach((n) => {
    const bucket = bucketFor(n.created_at);
    if (!groups.has(bucket)) groups.set(bucket, []);
    groups.get(bucket)!.push(n);
  });
  return BUCKET_ORDER.filter((b) => groups.has(b)).map((bucket) => ({
    bucket,
    items: groups.get(bucket)!,
  }));
}

/** Type-grouped notification list for the full notifications page. */
export function groupByType(items: Notification[]): Array<{ type: NotificationType; items: Notification[] }> {
  const groups = new Map<NotificationType, Notification[]>();
  items.forEach((n) => {
    const type = normalizeType(n.type);
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type)!.push(n);
  });
  return Array.from(groups.entries())
    .map(([type, list]) => ({ type, items: list }))
    .sort((a, b) => b.items.length - a.items.length);
}
