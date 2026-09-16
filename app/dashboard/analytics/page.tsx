'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { KpiCard } from '@/components/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartTooltip, CHART_PALETTE, AXIS_DEFAULTS, GRID_DEFAULTS } from '@/components/dashboard/charts';
import {
  fetchAnalyticsSnapshot, fetchAutomationRate, percentChange,
  type AnalyticsSnapshot, type CategorySlice,
} from '@/lib/services/analytics-service';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { MessageSquare, Bot, User, Inbox, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = 14;

function fmtDate(d: string) { return d; }
function titleize(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AnalyticsPage() {
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [automation, setAutomation] = useState<{ rate: number | null; aiMessages: number; handovers: number; conversations: number } | null>(null);

  useEffect(() => {
    if (!currentBusiness) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchAnalyticsSnapshot(currentBusiness.id, DAYS),
      fetchAutomationRate(currentBusiness.id),
    ]).then(([snap, auto]) => {
      if (cancelled) return;
      setSnapshot(snap);
      setAutomation(auto);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [currentBusiness]);

  const volumeTrend = snapshot ? snapshot.volume.reduce((a, d) => a + d.total, 0) : 0;
  const recentHalf = snapshot ? snapshot.volume.slice(Math.ceil(DAYS / 2)).reduce((a, d) => a + d.total, 0) : 0;
  const priorHalf = snapshot ? snapshot.volume.slice(0, Math.floor(DAYS / 2)).reduce((a, d) => a + d.total, 0) : 0;
  const volumeDelta = percentChange(recentHalf, priorHalf);

  const automationRate = automation?.rate ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description={`Conversation insights and automation performance — last ${DAYS} days`}
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Messages"
          value={snapshot?.stats.totalMessages ?? 0}
          icon={MessageSquare}
          tone="primary"
          delta={loading ? null : volumeDelta}
          deltaLabel="2nd half vs 1st"
          loading={loading}
        />
        <KpiCard
          label="AI responses"
          value={snapshot?.stats.aiMessages ?? 0}
          icon={Bot}
          tone="primary"
          loading={loading}
        />
        <KpiCard
          label="Customer messages"
          value={snapshot?.stats.customerMessages ?? 0}
          icon={User}
          tone="warning"
          loading={loading}
        />
        <KpiCard
          label="Conversations"
          value={snapshot?.stats.conversations ?? 0}
          icon={Inbox}
          tone="success"
          loading={loading}
        />
      </div>

      {/* Message volume — stacked area */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Message volume</CardTitle>
            <CardDescription>Customer vs AI assistant messages per day</CardDescription>
          </div>
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              volumeDelta === null ? 'bg-secondary text-secondary-foreground'
                : volumeDelta >= 0 ? 'bg-success-soft text-success-soft-fg' : 'bg-destructive-soft text-destructive-soft-fg'
            )}
          >
            {volumeDelta === null ? 'No trend yet' : volumeDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {volumeDelta !== null && `${volumeDelta >= 0 ? '+' : ''}${volumeDelta.toFixed(0)}%`}
          </span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : !snapshot || volumeTrend === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No messages in this period yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={snapshot.volume} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="cust-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="ai-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_DEFAULTS} />
                <XAxis dataKey="date" {...AXIS_DEFAULTS} />
                <YAxis {...AXIS_DEFAULTS} allowDecimals={false} />
                <ChartTooltip />
                <Area type="monotone" dataKey="customer" name="Customer" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#cust-grad)" stackId="vol" />
                <Area type="monotone" dataKey="assistant" name="AI assistant" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#ai-grad)" stackId="vol" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Intent donut */}
        <Card>
          <CardHeader>
            <CardTitle>Intent distribution</CardTitle>
            <CardDescription>What customers ask about most</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mx-auto h-60 w-60 rounded-full" />
            ) : !snapshot || snapshot.intents.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={snapshot.intents.slice(0, 6)}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={88}
                      dataKey="value" paddingAngle={2} strokeWidth={0}
                    >
                      {snapshot.intents.slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(v) => `${v} conversations`} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="w-full max-w-[220px] space-y-1.5">
                  {snapshot.intents.slice(0, 6).map((slice: CategorySlice, i) => (
                    <li key={slice.name} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                      <span className="truncate text-muted-foreground">{titleize(slice.name)}</span>
                      <span className="ml-auto font-medium tabular-nums">{slice.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel bars */}
        <Card>
          <CardHeader>
            <CardTitle>Channels</CardTitle>
            <CardDescription>Where conversations start</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-60 w-full rounded-lg" />
            ) : !snapshot || snapshot.channels.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={snapshot.channels.map((c) => ({ ...c, name: titleize(c.name) }))} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" {...AXIS_DEFAULTS} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} {...AXIS_DEFAULTS} />
                  <ChartTooltip formatter={(v) => `${v} conversations`} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                    {snapshot.channels.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Automation rate */}
      <Card>
        <CardHeader>
          <CardTitle>Automation rate</CardTitle>
          <CardDescription>Share of conversations handled end-to-end without a human</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !automation ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : automationRate === null ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No conversations yet — the rate appears once customers start chatting.</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(automationRate / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-lg font-bold tabular-nums">{automationRate}%</span>
              </div>
              <div className="grid flex-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-secondary/40 p-3">
                  <p className="text-caption text-muted-foreground">AI messages</p>
                  <p className="text-xl font-bold tabular-nums">{automation.aiMessages.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border bg-secondary/40 p-3">
                  <p className="text-caption text-muted-foreground">Human handovers</p>
                  <p className="text-xl font-bold tabular-nums">{automation.handovers.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border bg-secondary/40 p-3">
                  <p className="text-caption text-muted-foreground">Total conversations</p>
                  <p className="text-xl font-bold tabular-nums">{automation.conversations.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
