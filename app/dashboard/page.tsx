'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  MessageSquare, Users, ShoppingCart, Calendar, Inbox, Zap,
  Bot, ArrowUpRight, Clock, Sparkles, Activity, ArrowRight, BarChart3,
} from 'lucide-react';

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

interface RecentConv {
  id: string;
  channel: string;
  detected_intent: string | null;
  status: string;
  created_at: string;
  is_handover: boolean;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />;
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-success',
    resolved: 'bg-slate-400',
    handover: 'bg-warning',
    pending: 'bg-blue-500',
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${map[status] ?? 'bg-slate-400'}`} />;
}

function IntentBadge({ intent }: { intent: string | null }) {
  if (!intent) return <span className="badge-neutral">general</span>;
  const lower = intent.toLowerCase().replace(/_/g, ' ');
  const map: Record<string, string> = {
    order: 'badge-primary',
    booking: 'badge-primary',
    appointment: 'badge-primary',
    complaint: 'badge-destructive',
    human_support: 'badge-warning',
  };
  const cls = map[intent.toLowerCase()] ?? 'badge-neutral';
  return <span className={cls}>{lower}</span>;
}

export default function DashboardOverview() {
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    conversations: 0, customers: 0, orders: 0, bookings: 0,
    pendingRequests: 0, activeWorkflows: 0, aiHandled: 0, handovers: 0,
  });
  const [recentConvs, setRecentConvs] = useState<RecentConv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;
    load();
  }, [currentBusiness]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const bid = currentBusiness.id;

    const [convs, custs, ords, bkgs, reqs, wfs, aiMsgs, handovers, recent] = await Promise.all([
      supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', bid),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', bid),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', bid),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', bid),
      supabase.from('requests').select('*', { count: 'exact', head: true }).eq('business_id', bid).eq('status', 'pending'),
      supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('business_id', bid).eq('status', 'active'),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('business_id', bid).eq('sender_type', 'assistant'),
      supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', bid).eq('is_handover', true),
      supabase.from('conversations').select('id,channel,detected_intent,status,created_at,is_handover').eq('business_id', bid).order('created_at', { ascending: false }).limit(6),
    ]);

    setStats({
      conversations: convs.count ?? 0,
      customers: custs.count ?? 0,
      orders: ords.count ?? 0,
      bookings: bkgs.count ?? 0,
      pendingRequests: reqs.count ?? 0,
      activeWorkflows: wfs.count ?? 0,
      aiHandled: aiMsgs.count ?? 0,
      handovers: handovers.count ?? 0,
    });
    setRecentConvs((recent.data ?? []) as RecentConv[]);
    setLoading(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const metrics = [
    { label: 'Conversations', value: stats.conversations, icon: MessageSquare, href: '/dashboard/conversations' },
    { label: 'Customers', value: stats.customers, icon: Users, href: '/dashboard/customers' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, href: '/dashboard/orders' },
    { label: 'Bookings', value: stats.bookings, icon: Calendar, href: '/dashboard/bookings' },
    { label: 'Pending requests', value: stats.pendingRequests, icon: Inbox, href: '/dashboard/requests' },
    { label: 'Active workflows', value: stats.activeWorkflows, icon: Zap, href: '/dashboard/automation' },
  ];

  const aiRate = stats.conversations > 0
    ? Math.round(((stats.conversations - stats.handovers) / stats.conversations) * 100)
    : 0;

  const quickActions = [
    { href: '/dashboard/products/new', label: 'Add product', icon: ShoppingCart },
    { href: '/dashboard/services/new', label: 'Add service', icon: Sparkles },
    { href: '/dashboard/knowledge', label: 'Add knowledge', icon: BarChart3 },
    { href: '/dashboard/automation', label: 'New workflow', icon: Activity },
  ];

  return (
    <div className="space-y-6 animate-in-fade">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label text-muted-foreground">{today}</p>
          <h1 className="text-heading mt-2 text-foreground">
            {greeting}, <span className="text-voice ">{firstName}</span>.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening at {currentBusiness?.name ?? 'your business'}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/chat" target="_blank">
            <button className="press flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-foreground">
              <Bot className="h-4 w-4 text-primary" />
              Test AI chat
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </header>

      {/* ── Metrics strip — one band, hairline divided ─────── */}
      <div
        className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 sm:grid-cols-3 lg:grid-cols-6"
        style={{ background: 'hsl(var(--border) / 0.7)' }}
      >
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group bg-card px-4 py-5 transition-colors duration-200 hover:bg-accent/60 sm:px-5"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <m.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-xs font-medium text-muted-foreground">{m.label}</span>
              <ArrowUpRight className="ml-auto h-3 w-3 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-60" />
            </div>
            <p className="mt-2 font-mono text-[26px] font-semibold leading-none tracking-tight text-foreground">
              {loading ? '—' : m.value}
            </p>
          </Link>
        ))}
      </div>

      {/* ── Body: conversations (hero) + right rail ────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recent conversations — the product's heartbeat */}
        <section className="surface-raised rounded-2xl p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Recent conversations</h2>
                <p className="text-[11px] text-muted-foreground">Live from your web chat</p>
              </div>
            </div>
            <Link
              href="/dashboard/conversations"
              className="link-draw flex items-center gap-1 text-xs font-medium text-primary"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <SkeletonBlock key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recentConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No conversations yet</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Share your chat link with customers to start receiving messages.
              </p>
              <Link href="/chat" target="_blank" className="mt-4">
                <button className="press flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15">
                  <Bot className="h-3.5 w-3.5" />
                  Test the chat
                </button>
              </Link>
            </div>
          ) : (
            <ul className="-mx-2">
              {recentConvs.map((c) => (
                <li key={c.id}>
                  <Link href={`/dashboard/conversations/${c.id}`} className="group block">
                    <div className="flex items-center gap-3.5 rounded-xl px-2.5 py-3 transition-colors duration-200 hover:bg-muted/60">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusDot status={c.status} />
                          <span className="text-[13px] font-medium text-foreground capitalize">
                            {c.channel.replace('_', ' ')}
                          </span>
                          {c.is_handover && <span className="badge-warning text-[10px]">Handover</span>}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <IntentBadge intent={c.detected_intent} />
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(c.created_at).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right rail */}
        <aside className="space-y-5">
          {/* AI performance */}
          <section className="surface-raised rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </span>
                <h2 className="text-sm font-semibold text-foreground">AI performance</h2>
              </div>
              <Link href="/dashboard/ai" className="link-draw text-xs font-medium text-primary">
                Details
              </Link>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="32" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - aiRate / 100)}`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="font-mono text-lg font-semibold">{loading ? '—' : `${aiRate}%`}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Automation rate</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Conversations handled without human intervention
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-[13px] font-medium">AI responses</span>
                </div>
                <span className="font-mono text-base font-semibold">{loading ? '—' : stats.aiHandled}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-warning" />
                  <span className="text-[13px] font-medium">Human handovers</span>
                </div>
                <span className="font-mono text-base font-semibold">{loading ? '—' : stats.handovers}</span>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="surface-raised rounded-2xl p-6">
            <h2 className="text-label mb-4 text-muted-foreground">Quick actions</h2>
            <ul className="space-y-1.5">
              {quickActions.map((a) => (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200 hover:border-border/70 hover:bg-muted/50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <a.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                    </span>
                    <span className="text-[13px] font-medium text-foreground">{a.label}</span>
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
