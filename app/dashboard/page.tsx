'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, ShoppingCart, Calendar, Inbox, Bot, Zap, TrendingUp, Activity, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  conversations: number;
  customers: number;
  orders: number;
  bookings: number;
  pendingRequests: number;
  activeWorkflows: number;
  aiHandled: number;
  handovers: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  time: string;
  status: string;
}

export default function DashboardOverview() {
  const { currentBusiness } = useBusiness();
  const [stats, setStats] = useState<Stats>({
    conversations: 0, customers: 0, orders: 0, bookings: 0,
    pendingRequests: 0, activeWorkflows: 0, aiHandled: 0, handovers: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;
    loadStats();
  }, [currentBusiness]);

  const loadStats = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const bid = currentBusiness.id;

    const [convs, custs, ords, bkgs, reqs, wfs, aiMsgs, handovers] = await Promise.all([
      supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', bid),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', bid),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', bid),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', bid),
      supabase.from('requests').select('*', { count: 'exact', head: true }).eq('business_id', bid).eq('status', 'pending'),
      supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('business_id', bid).eq('status', 'active'),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('business_id', bid).eq('sender_type', 'assistant'),
      supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', bid).eq('is_handover', true),
    ]);

    setStats({
      conversations: convs.count || 0,
      customers: custs.count || 0,
      orders: ords.count || 0,
      bookings: bkgs.count || 0,
      pendingRequests: reqs.count || 0,
      activeWorkflows: wfs.count || 0,
      aiHandled: aiMsgs.count || 0,
      handovers: handovers.count || 0,
    });

    const { data: recentConvs } = await supabase
      .from('conversations')
      .select('*')
      .eq('business_id', bid)
      .order('created_at', { ascending: false })
      .limit(5);

    const acts: RecentActivity[] = (recentConvs || []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      type: 'conversation',
      title: `${c.channel} conversation — ${c.detected_intent || 'general'}`,
      time: c.created_at as string,
      status: c.status as string,
    }));
    setActivities(acts);
    setLoading(false);
  };

  const statCards = [
    { label: 'Conversations', value: stats.conversations, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Bookings', value: stats.bookings, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Inbox, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Active Workflows', value: stats.activeWorkflows, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">{currentBusiness?.name} — business dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-bold">{loading ? '—' : s.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              AI Assistant Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Responses</p>
                  <p className="text-2xl font-bold">{stats.aiHandled}</p>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Human Handovers</p>
                  <p className="text-2xl font-bold">{stats.handovers}</p>
                </div>
              </div>
            </div>
            <Link href="/chat" target="_blank" className="block">
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                <span className="text-sm font-medium">Test your AI assistant</span>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No activity yet. Start by testing your customer chat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge variant={a.status === 'active' ? 'default' : a.status === 'handover' ? 'secondary' : 'outline'}>
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
