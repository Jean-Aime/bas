'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/page-states';
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead,
  groupByTime, normalizeType, NOTIFICATION_TYPE_META,
  type NotificationType,
} from '@/lib/services/notifications-service';
import { useNotificationsRealtime } from '@/lib/services/use-notifications-realtime';
import type { Notification as BizNotification } from '@/lib/types';
import {
  Bell, BellOff, CheckCheck, ShoppingCart, Calendar, Inbox, AlertTriangle,
  Info, UserPlus, Workflow as WorkflowIcon, Plug, BookOpen, ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  order: ShoppingCart,
  booking: Calendar,
  request: Inbox,
  handover: UserPlus,
  workflow: WorkflowIcon,
  integration: Plug,
  knowledge: BookOpen,
  system: Info,
};

const TYPE_TONES: Record<NotificationType, string> = {
  order: 'bg-primary/10 text-primary',
  booking: 'bg-success-soft text-success-soft-fg',
  request: 'bg-info-soft text-info-soft-fg',
  handover: 'bg-warning-soft text-warning-soft-fg',
  workflow: 'bg-primary/10 text-primary',
  integration: 'bg-warning-soft text-warning-soft-fg',
  knowledge: 'bg-info-soft text-info-soft-fg',
  system: 'bg-secondary text-secondary-foreground',
};

type Filter = 'all' | 'unread' | NotificationType;

export default function NotificationsPage() {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const [items, setItems] = useState<BizNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  const reload = useCallback(async () => {
    if (!user || !currentBusiness) return;
    setLoading(true);
    const page = await fetchNotifications(currentBusiness.id, user.id, { limit: 100 });
    setItems(page.items);
    setLoading(false);
  }, [user, currentBusiness]);

  useEffect(() => { reload(); }, [reload]);

  // Instant refresh when notifications change (inserts/mark-read) server-side.
  useNotificationsRealtime({ businessId: currentBusiness?.id, userId: user?.id, onChange: reload });

  const unreadCount = useMemo(() => items.filter((n) => !n.is_read).length, [items]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'unread') return items.filter((n) => !n.is_read);
    return items.filter((n) => normalizeType(n.type) === filter);
  }, [items, filter]);

  const presentTypes = useMemo(() => {
    const set = new Set(items.map((n) => normalizeType(n.type)));
    return Array.from(set);
  }, [items]);

  const handleOpen = async (id: string, isRead: boolean, link: string | null) => {
    if (!isRead) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      markNotificationRead(id);
    }
    // Navigation happens via the wrapping Link.
  };

  const handleMarkAll = async () => {
    if (!user || !currentBusiness) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsRead(currentBusiness.id, user.id);
  };

  const groups = groupByTime(filtered);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Orders, bookings, escalations, workflow runs, and system events for your business."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={loading || unreadCount === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
            {unreadCount > 0 && <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">{unreadCount}</Badge>}
          </Button>
        }
      />

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{unreadCount}</Badge>}
          </TabsTrigger>
          {presentTypes.map((t) => (
            <TabsTrigger key={t} value={t} className="gap-1.5">
              {(() => { const Icon = TYPE_ICONS[t]; return <Icon className="h-3.5 w-3.5" />; })()}
              {NOTIFICATION_TYPE_META[t].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grouped list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={filter === 'all' ? BellOff : Bell}
              title={filter === 'unread' ? 'All caught up' : filter === 'all' ? 'No notifications yet' : `No ${NOTIFICATION_TYPE_META[filter as NotificationType].label.toLowerCase()} notifications`}
              description="When customers place orders, request bookings, or need a human, they'll appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.bucket}>
              <h2 className="mb-2 px-1 text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                {group.bucket}
                <span className="ml-2 font-normal text-muted-foreground/60">{group.items.length}</span>
              </h2>
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {group.items.map((n) => {
                      const type = normalizeType(n.type);
                      const Icon = TYPE_ICONS[type];
                      return (
                        <li key={n.id} className={cn(!n.is_read && 'bg-primary/[0.04]')}>
                          <Link
                            href={n.link?.startsWith('/') ? n.link : '#'}
                            onClick={(e) => { if (!n.link) e.preventDefault(); handleOpen(n.id, n.is_read, n.link); }}
                            className={cn(
                              'flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/50',
                              !n.link && 'cursor-default'
                            )}
                          >
                            <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TYPE_TONES[type])}>
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className={cn('text-sm', n.is_read ? 'font-medium' : 'font-semibold')}>{n.title}</p>
                                {!n.is_read && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    New
                                  </span>
                                )}
                                <span className="ml-auto hidden shrink-0 text-xs text-muted-foreground sm:inline">
                                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                              <p className="mt-1 text-xs text-muted-foreground/70 sm:hidden">
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            {n.link && <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
