'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead, groupByTime, normalizeType,
} from '@/lib/services/notifications-service';
import { useNotificationsRealtime } from '@/lib/services/use-notifications-realtime';
import {
  Bell, BellOff, CheckCheck, ShoppingCart, Calendar, Inbox, AlertTriangle,
  Info, UserPlus, Workflow as WorkflowIcon, Plug, BookOpen, Loader2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Notification as BizNotification } from '@/lib/types';

const TYPE_ICONS: Record<string, LucideIcon> = {
  order: ShoppingCart,
  booking: Calendar,
  request: Inbox,
  handover: UserPlus,
  workflow: WorkflowIcon,
  integration: Plug,
  knowledge: BookOpen,
  warning: AlertTriangle,
  error: AlertTriangle,
  success: CheckCheck,
  system: Info,
};

const TYPE_TONES: Record<string, string> = {
  order: 'bg-primary/10 text-primary',
  booking: 'bg-success-soft text-success-soft-fg',
  request: 'bg-info-soft text-info-soft-fg',
  handover: 'bg-warning-soft text-warning-soft-fg',
  workflow: 'bg-primary/10 text-primary',
  integration: 'bg-warning-soft text-warning-soft-fg',
  knowledge: 'bg-info-soft text-info-soft-fg',
  warning: 'bg-warning-soft text-warning-soft-fg',
  error: 'bg-destructive-soft text-destructive-soft-fg',
  success: 'bg-success-soft text-success-soft-fg',
  system: 'bg-secondary text-secondary-foreground',
};

/** Compact popover preview of the latest notifications (full center: /dashboard/notifications). */
export function NotificationsBell() {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<BizNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!user || !currentBusiness) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    const page = await fetchNotifications(currentBusiness.id, user.id, { limit: 20 });
    setNotifications(page.items);
    setUnreadCount(page.unreadCount);
    setLoading(false);
  }, [user, currentBusiness]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  // Instant updates via realtime; 30s polling remains as fallback.
  useNotificationsRealtime({ businessId: currentBusiness?.id, userId: user?.id, onChange: load });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) load();
  };

  const handleClick = async (n: BizNotification) => {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, is_read: true } : p)));
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationRead(n.id);
    }
    if (n.link) {
      const href = n.link.startsWith('/') ? n.link : `/${n.link}`;
      router.push(href);
    }
    setOpen(false);
  };

  const handleMarkAll = async () => {
    if (!user || !currentBusiness) return;
    setNotifications((prev) => prev.map((p) => ({ ...p, is_read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead(currentBusiness.id, user.id);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAll}>
                <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setOpen(false); router.push('/dashboard/notifications'); }}>
              View all
            </Button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <BellOff className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">You&apos;re all caught up</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Orders, bookings and escalations will appear here.</p>
            </div>
          ) : (
            groupByTime(notifications).map((group) => (
              <div key={group.bucket}>
                <p className="sticky top-0 z-10 border-b bg-popover/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                  {group.bucket}
                </p>
                {group.items.map((n) => {
                  const Icon = TYPE_ICONS[normalizeType(n.type)] || Info;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={cn(
                        'flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/60',
                        !n.is_read && 'bg-primary/[0.04]'
                      )}
                    >
                      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', TYPE_TONES[normalizeType(n.type)])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('truncate text-sm', n.is_read ? 'font-medium' : 'font-semibold')}>{n.title}</p>
                          {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
