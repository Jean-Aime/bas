'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/page-states';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && currentBusiness) loadNotifications();
  }, [user, currentBusiness]);

  const loadNotifications = async () => {
    if (!user || !currentBusiness) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('business_id', currentBusiness.id)
      .order('created_at', { ascending: false });
    setNotifications((data || []) as NotificationItem[]);
    setLoading(false);
  };

  const markAllRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length === 0) return;
    const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', unread);
    if (!error) loadNotifications();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Orders, bookings, escalations, and system events for your business.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={!notifications.some((n) => !n.is_read)}>
          <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications yet" description="When customers place orders, request bookings, or escalate, they'll appear here." />
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.is_read ? '' : 'bg-primary/5'}`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.is_read && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">New</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {n.link && (
                    <Link href={n.link} className="shrink-0">
                      <Button size="sm" variant="ghost">Open</Button>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}