'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBusiness } from '@/lib/auth/business-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchDashboardStats, fetchRecentConversations, fetchWeeklyVolume,
  type DashboardStats, type RecentActivityRow, type VolumePoint,
} from '@/lib/services/dashboard-service';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  MessageSquare, Users, ShoppingCart, Calendar, Inbox, Bot, Zap, Activity, ArrowUpRight, Workflow, CheckCircle2, Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface DailyPoint extends VolumePoint {}

export default function DashboardOverview() {
  const { currentBusiness } = useBusiness();
  const [stats, setStats] = useState<DashboardStats>({
    conversations: 0, customers: 0, orders: 0, bookings: 0,
    pendingRequests: 0, activeWorkflows: 0, aiHandled: 0, handovers: 0,
  });
  const [activities, setActivities] = useState<RecentActivityRow[]>([]);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusiness]);

  const loadStats = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const bid = currentBusiness.id;

    const [s, recent, volume] = await Promise.all([
      fetchDashboardStats(bid),
      fetchRecentConversations(bid, 5),
      fetchWeeklyVolume(bid),
    ]);

    setStats(s);
    setActivities(recent);
    setDaily(volume);
    setLoading(false);
  };

  const aiRate = stats.conversations > 0
    ? Math.min(100, Math.round(((stats.conversations - stats.handovers) / stats.conversations) * 100))
    : null;

  const setupSteps = [
    { label: 'Business profile', done: !!currentBusiness?.name, href: '/dashboard/settings/business' },
    { label: 'Knowledge configured', done: stats.conversations > 0, href: '/dashboard/knowledge' },
    { label: 'First workflow active', done: stats.activeWorkflows > 0, href: '/dashboard/automation' },
    { label: 'Test conversation', done: stats.conversations > 0, href: '/chat' },
  ];
  const setupDone = setupSteps.filter((s) => s.done).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${greeting()}, ${currentBusiness?.name ?? 'there'}`}
        description="Here's what's happening across your business today."
      />

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Conversations" value={stats.conversations} icon={MessageSquare} tone="primary" loading={loading} href="/dashboard/conversations" />
        <KpiCard label="Customers" value={stats.customers} icon={Users} loading={loading} href="/dashboard/customers" />
        <KpiCard label="Orders" value={stats.orders} icon={ShoppingCart} loading={loading} href="/dashboard/orders" />
        <KpiCard label="Bookings" value={stats.bookings} icon={Calendar} loading={loading} href="/dashboard/bookings" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* AI activity — spans 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Assistant Activity
              </CardTitle>
              <CardDescription>Automation performance across conversations</CardDescription>
            </div>
            <Badge variant={aiRate !== null && aiRate >= 80 ? 'success' : 'info'}>
              {aiRate !== null ? `${aiRate}% automated` : 'No data'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-secondary/40 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">AI responses</p>
                    {loading ? <Skeleton className="mt-1 h-6 w-10" /> : <p className="text-xl font-bold tabular-nums">{stats.aiHandled}</p>}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-secondary/40 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft">
                    <MessageSquare className="h-4.5 w-4.5 text-warning-soft-fg" />
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">Human handovers</p>
                    {loading ? <Skeleton className="mt-1 h-6 w-10" /> : <p className="text-xl font-bold tabular-nums">{stats.handovers}</p>}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-secondary/40 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft">
                    <Zap className="h-4.5 w-4.5 text-success-soft-fg" />
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground">Active workflows</p>
                    {loading ? <Skeleton className="mt-1 h-6 w-10" /> : <p className="text-xl font-bold tabular-nums">{stats.activeWorkflows}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Automation rate bar */}
            {aiRate !== null && (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Automation rate</span>
                  <span className="font-medium text-foreground">{aiRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-info transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(aiRate, 2)}%` }}
                  />
                </div>
              </div>
            )}

            {/* 7-day message volume */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-caption font-medium text-muted-foreground">Message volume — last 7 days</p>
                <Badge variant="outline">{daily.reduce((a, d) => a + d.messages, 0)} messages</Badge>
              </div>
              {loading ? (
                <Skeleton className="h-28 w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={112}>
                  <AreaChart data={daily} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                    <defs>
                      <linearGradient id="vol-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ stroke: 'hsl(var(--primary) / 0.3)' }}
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                        fontSize: 12,
                        boxShadow: '0 4px 6px -1px hsl(224 64% 10% / 0.06)'
                      }}
                    />
                    <Area type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#vol-grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <Link href="/chat" target="_blank" className="block">
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3.5 transition-all duration-150 hover:border-primary/40 hover:bg-primary/10">
                <div className="flex items-center gap-2.5">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Test your AI assistant</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Setup checklist */}
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle>Setup</CardTitle>
              <CardDescription>Complete your workspace</CardDescription>
            </div>
            <Badge variant={setupDone === setupSteps.length ? 'success' : 'warning'}>
              {setupDone}/{setupSteps.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {setupSteps.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary"
                  >
                    {s.done ? (
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-success" />
                    ) : (
                      <Circle className="h-4.5 w-4.5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={cn('flex-1 text-sm', s.done ? 'text-muted-foreground line-through' : 'font-medium')}>
                      {s.label}
                    </span>
                    {!s.done && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest conversations across your channels</CardDescription>
          </div>
          <Link href="/dashboard/conversations">
            <Button variant="ghost" size="sm">
              View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-10 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <Workflow className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No activity yet</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Start by testing your customer chat — conversations will appear here in real time.</p>
              </div>
              <Link href="/chat" target="_blank">
                <Button size="sm" variant="outline">Open customer chat</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/conversations/${a.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium capitalize">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleString()}</p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard label="Pending requests" value={stats.pendingRequests} icon={Inbox} tone="warning" loading={loading} href="/dashboard/requests" />
        <KpiCard label="Active workflows" value={stats.activeWorkflows} icon={Zap} tone="primary" loading={loading} href="/dashboard/automation" />
      </div>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
