'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import {
  Zap, ArrowRight, CheckCircle2, Menu, X, Sparkles,
  Bot, Workflow, Globe, Shield, Building2, MessageSquare,
  Package, CalendarCheck, Hand, ArrowUpRight, Check, Plus,
} from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/pricing', label: 'Pricing' },
];

const TRUST = [
  'No credit card required',
  'Works without a website',
  'Live in under five minutes',
];

const HOME_PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    blurb: 'For solo businesses testing automation.',
    features: ['1 business', 'Web chat assistant', '10 conversations / month', 'Knowledge base'],
    highlight: false,
  },
  {
    name: 'Business',
    price: '$29 / mo',
    blurb: 'For growing businesses that live in chat.',
    features: ['Up to 3 businesses', 'Unlimited conversations', 'Orders & bookings', 'Workflow automation', 'Human handover'],
    highlight: true,
  },
  {
    name: 'Professional',
    price: '$79 / mo',
    blurb: 'For teams that need the full toolkit.',
    features: ['Up to 10 businesses', 'Team roles & permissions', 'Website ingestion', 'Advanced analytics'],
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    blurb: 'For organizations with advanced needs.',
    features: ['Unlimited businesses', 'Custom integrations', 'Dedicated manager', 'SSO & compliance'],
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Customers used to message at night and wait until morning. Now they get prices, stock and reservations instantly — we just handle the pickup.',
    name: 'Claudine U.',
    role: 'Urban Threads, Kigali',
    initials: 'CU',
  },
  {
    quote:
      'Bookings land in the calendar with the service and duration already set. My team stopped retyping the same requests all day.',
    name: 'Aline M.',
    role: 'Beauty Salon Kigali',
    initials: 'AM',
  },
  {
    quote:
      'Guests ask about rooms, rates and check-in at any hour. BAS answers exactly as we would, and hands over when someone wants a person.',
    name: 'Patrick N.',
    role: 'Lakeview Hotel',
    initials: 'PN',
  },
];

const HOME_FAQ = [
  {
    q: 'Do I need a website to use BAS?',
    a: 'No. BAS works for businesses with no digital presence at all — enter your services, prices, hours and policies manually, and the assistant answers from that information.',
  },
  {
    q: 'Will the AI invent information it doesn’t know?',
    a: 'No. The assistant only answers from the structured business knowledge you provide. If it doesn’t know something, it asks for details and hands the request to your team instead of guessing.',
  },
  {
    q: 'Can my team take over a conversation from the AI?',
    a: 'Yes. The AI escalates when the customer asks for a person, confidence is low, or a request is outside its capabilities. Your staff takes over with the full conversation context.',
  },
  {
    q: 'Is my business data isolated from other businesses?',
    a: 'Yes. Every business is a separate tenant with row-level security enforced at the database. Business A can never see Business B’s data.',
  },
  {
    q: 'Which channels does BAS support?',
    a: 'Web chat works today. WhatsApp and email are architecturally planned and will be connected in later phases.',
  },
];

const METRICS = [
  { value: '< 5 min', label: 'From sign-up to live chat' },
  { value: '15', label: 'Intent types understood' },
  { value: '100%', label: 'Data isolated per business' },
  { value: '24/7', label: 'Coverage, no shifts to fill' },
];

/* ── Chat artifact shown in the hero: real product UI, real story ── */
const HERO_THREAD = [
  {
    from: 'customer',
    text: 'Hi! Do you have the Air Max 90 in size 42?',
  },
  {
    from: 'bot',
    text: 'Yes — size 42 is in stock at RWF 85,000. Shall I hold a pair for you?',
    intent: 'PRODUCT_INQUIRY',
    confidence: 94,
  },
  {
    from: 'customer',
    text: 'Yes please, I’ll come by tomorrow afternoon.',
  },
  {
    from: 'bot',
    order: {
      id: '#1042',
      item: 'Nike Air Max 90 · Size 42',
      total: 'RWF 85,000',
      status: 'Reserved',
    },
    intent: 'ORDER',
    confidence: 97,
  },
];

const BENTO = [
  {
    span: 'lg:col-span-7',
    label: 'Intent engine',
    title: 'It understands what customers mean',
    body: 'Fifteen intent types — product questions, orders, bookings, complaints, handover requests — detected from plain conversation, each with a confidence score your team can trust.',
    visual: 'intents',
    icon: Bot,
  },
  {
    span: 'lg:col-span-5',
    label: 'Capture',
    title: 'Chat turns into orders and bookings',
    body: 'When a customer decides, BAS writes the record — product, quantity, price — and pings the owner. Nothing falls through the cracks.',
    visual: 'records',
    icon: Package,
  },
  {
    span: 'lg:col-span-5',
    label: 'Knowledge',
    title: 'Your website becomes its brain',
    body: 'Paste a URL. BAS extracts, structures, and indexes your content so every answer sounds like your business.',
    visual: 'knowledge',
    icon: Globe,
  },
  {
    span: 'lg:col-span-7',
    label: 'Handover',
    title: 'Knows when to step aside',
    body: 'Sensitive or low-confidence conversations escalate to a human in one move — with the full transcript and detected intent attached.',
    visual: 'handover',
    icon: Hand,
  },
  {
    span: 'lg:col-span-4',
    label: 'Multi-business',
    title: 'One account, many businesses',
    body: 'Switch workspaces in a click. Every table stays tenant-isolated at the database layer.',
    visual: 'tenants',
    icon: Building2,
  },
  {
    span: 'lg:col-span-4',
    label: 'Channels',
    title: 'Chat first. More channels next.',
    body: 'Web chat is live today. WhatsApp and email slots are built and waiting in the same inbox.',
    visual: 'channels',
    icon: MessageSquare,
  },
  {
    span: 'lg:col-span-4',
    label: 'Security',
    title: 'Row-level by default',
    body: 'Authorization lives in Postgres, not in UI code. Audit trails on every consequential action.',
    visual: 'security',
    icon: Shield,
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Create your business',
    desc: 'Name, hours, products, services, policies — a guided flow, done in minutes. Works with or without a website.',
  },
  {
    n: '02',
    title: 'Point it at your knowledge',
    desc: 'Import from your website URL or type it in. BAS structures everything for instant retrieval.',
  },
  {
    n: '03',
    title: 'Share your chat link',
    desc: 'Customers get answers, orders and bookings get captured, and your team gets pinged only when it matters.',
  },
];

function IntentVisual() {
  const rows = [
    { label: 'ORDER', pct: 97 },
    { label: 'BOOKING', pct: 92 },
    { label: 'COMPLAINT', pct: 88 },
    { label: 'HUMAN_SUPPORT', pct: 81 },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div
          key={r.label}
          className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3.5 py-2.5"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <span className="w-32 shrink-0 font-mono text-[10px] font-semibold tracking-wider text-foreground/70">
            {r.label}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full brand-fill"
              style={{ width: `${r.pct}%` }}
            />
          </div>
          <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">{r.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function RecordsVisual() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-background p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Package className="h-3 w-3" /> Order
          </span>
          <span className="badge-success text-[9px]">Reserved</span>
        </div>
        <p className="text-xs font-semibold">Air Max 90 · Size 42</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">RWF 85,000</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-background p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarCheck className="h-3 w-3" /> Booking
          </span>
          <span className="badge-warning text-[9px]">Pending</span>
        </div>
        <p className="text-xs font-semibold">Cut &amp; style · Thu 14:30</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">Salon · 2 pax</p>
      </div>
    </div>
  );
}

function KnowledgeVisual() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5">
        <Globe className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate font-mono text-[11px] text-foreground/80">urbanthreads.rw</span>
        <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
          indexed
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {['Shipping policy', 'Size guide', 'Store hours', 'Returns'].map((t) => (
          <span key={t} className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function HandoverVisual() {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10 text-warning">
          <Hand className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">Escalated to a human</p>
          <p className="truncate text-[11px] text-muted-foreground">“The payment went through twice…”</p>
        </div>
        <span className="badge-warning text-[9px]">Billing</span>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        Transcript + intent attached · owner notified
      </div>
    </div>
  );
}

function TenantsVisual() {
  return (
    <div className="space-y-1.5">
      {['Urban Threads', 'Beauty Salon Kigali', 'Lakeview Hotel'].map((t, i) => (
        <div
          key={t}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${
            i === 0 ? 'border border-primary/30 bg-primary/5 text-foreground' : 'border border-border/60 bg-background text-muted-foreground'
          }`}
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${i === 0 ? 'brand-fill text-white' : 'bg-muted'}`}>
            {t[0]}
          </span>
          {t}
          {i === 0 && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-primary" />}
        </div>
      ))}
    </div>
  );
}

function ChannelsVisual() {
  return (
    <div className="space-y-1.5">
      {[
        { name: 'Web chat', live: true },
        { name: 'WhatsApp', live: false },
        { name: 'Email', live: false },
      ].map((c) => (
        <div key={c.name} className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-medium">
          <span className={`h-1.5 w-1.5 rounded-full ${c.live ? 'bg-success' : 'bg-muted-foreground/30'}`} />
          {c.name}
          <span className="ml-auto text-[10px] text-muted-foreground">{c.live ? 'Live' : 'Coming soon'}</span>
        </div>
      ))}
    </div>
  );
}

function SecurityVisual() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Shield className="h-[18px] w-[18px]" />
      </div>
      <div>
        <p className="font-mono text-[11px] font-semibold text-foreground">is_business_member()</p>
        <p className="text-[11px] text-muted-foreground">enforced in Postgres, per row</p>
      </div>
    </div>
  );
}

const BENTO_VISUALS: Record<string, React.ComponentType> = {
  intents: IntentVisual,
  records: RecordsVisual,
  knowledge: KnowledgeVisual,
  handover: HandoverVisual,
  tenants: TenantsVisual,
  channels: ChannelsVisual,
  security: SecurityVisual,
};

export default function Home() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-fill transition-transform duration-300 ease-out group-hover:scale-105">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-bold tracking-[0.1em]">BAS</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="brand-fill border-0">
                  Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="brand-fill border-0">
                    Get started
                  </Button>
                </Link>
              </>
            )}
            <button
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border/60 bg-background px-5 py-4 lg:hidden animate-in-up-sm">
            <div className="space-y-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-border/60 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero: asymmetric editorial on a charcoal canvas ──── */}
      <section className="relative overflow-hidden bg-chrome">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            {/* Left: story */}
            <div className="lg:col-span-6 xl:col-span-6">
              <div className="animate-in-up mb-6 inline-flex items-center gap-2.5 rounded-full border border-chrome-fg/20 bg-chrome-hover px-3.5 py-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-chrome-active animate-pulse-dot" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chrome-muted">
                  AI teammate for small business
                </span>
              </div>

              <h1 className="animate-in-up delay-75 text-display text-balance text-chrome-fg">
                Give your business an{' '}
                <span className="text-voice">AI front desk.</span>
              </h1>

              <p className="animate-in-up delay-150 mt-6 max-w-xl text-lg leading-relaxed text-chrome-muted text-pretty">
                BAS answers customer questions, takes orders, and books appointments — right inside your chat,
                around the clock. Your team only gets pinged when it actually matters.
              </p>

              <div className="animate-in-up delay-200 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/signup" className="sm:inline-block">
                  <Button size="lg" className="h-12 border-0 bg-background px-7 text-[15px] font-semibold text-foreground hover:bg-background/90 hover:text-foreground">
                    Start free — no card
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/chat" className="sm:inline-block">
                  <Button variant="outline" size="lg" className="h-12 border-chrome-fg/25 bg-transparent px-6 text-[15px] text-chrome-fg hover:bg-chrome-fg/10 hover:text-chrome-fg">
                    See it chat live
                    <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <ul className="animate-in-up delay-300 mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {TRUST.map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[13px] text-chrome-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-chrome-active" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: product artifact */}
            <div className="lg:col-span-6 xl:col-span-6">
              <div className="animate-in-up delay-200 relative mx-auto max-w-md lg:max-w-none">
                {/* floating context chips behind the card */}
                <div className="absolute -left-4 -top-5 hidden rounded-lg border border-border/70 bg-card px-3 py-1.5 text-[10px] font-semibold text-muted-foreground shadow-sm animate-in-fade delay-500 xl:block">
                  intent · <span className="text-primary">ORDER 97%</span>
                </div>
                <div className="absolute -right-3 bottom-16 hidden rounded-lg border border-border/70 bg-card px-3 py-1.5 text-[10px] font-semibold text-muted-foreground shadow-sm animate-in-fade delay-600 xl:block">
                  owner notified ✓
                </div>

                <div className="surface-raised overflow-hidden rounded-3xl">
                  {/* Chat header */}
                  <div className="flex items-center gap-3 border-b border-border/70 bg-muted/40 px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-fill text-sm font-bold text-white">
                      U
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">Urban Threads</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        AI assistant · replies instantly
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                      web chat
                    </span>
                  </div>

                  {/* Thread */}
                  <div className="space-y-3.5 px-5 py-6">
                    {HERO_THREAD.map((m, i) => (
                      <div
                        key={i}
                        className={`animate-in-up flex ${m.from === 'customer' ? 'justify-end' : 'justify-start'}`}
                        style={{ animationDelay: `${400 + i * 350}ms` }}
                      >
                        <div className={`max-w-[85%] ${m.from === 'customer' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-2.5 text-[13px] leading-relaxed ${
                              m.from === 'customer'
                                ? 'bubble-user rounded-2xl rounded-br-sm text-white'
                                : 'bubble-bot rounded-2xl rounded-bl-sm'
                            }`}
                          >
                            {'text' in m && m.text}
                            {'order' in m && m.order && (
                              <span className="mt-1 block rounded-xl border border-white/25 bg-white/10 p-2.5">
                                <span className="flex items-center justify-between text-[11px] font-semibold">
                                  Order {m.order.id}
                                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] uppercase tracking-wider">
                                    {m.order.status}
                                  </span>
                                </span>
                                <span className="mt-1 block text-[12px] opacity-90">{m.order.item}</span>
                                <span className="mt-0.5 block font-mono text-[12px] font-semibold">
                                  {m.order.total}
                                </span>
                              </span>
                            )}
                          </div>
                          {m.from === 'bot' && 'intent' in m && m.intent && (
                            <div className="mt-1.5 flex items-center gap-1.5 px-1">
                              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {m.intent}
                              </span>
                              <span className="h-0.5 w-8 overflow-hidden rounded-full bg-muted">
                                <span
                                  className="block h-full rounded-full bg-primary"
                                  style={{ width: `${m.confidence}%` }}
                                />
                              </span>
                              <span className="font-mono text-[9px] text-muted-foreground">{m.confidence}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Composer (decorative) */}
                  <div className="flex items-center gap-3 border-t border-border/70 bg-muted/40 px-5 py-3.5">
                    <span className="flex-1 rounded-lg bg-background px-3 py-2 text-[13px] text-muted-foreground/60">
                      Message Urban Threads…
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-fill text-white">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics band — hairline grid, not cards */}
          <div className="animate-in-up delay-500 mt-16 sm:mt-24">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 lg:grid-cols-4"
              style={{ background: 'hsl(var(--border) / 0.7)' }}>
              {METRICS.map((m) => (
                <div key={m.label} className="bg-card px-5 py-6 sm:px-7 sm:py-7">
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span className="block font-mono text-[26px] font-semibold tracking-tight text-foreground sm:text-3xl">
                      {m.value}
                    </span>
                    <span className="mt-1.5 block text-[13px] leading-snug text-muted-foreground">{m.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Bento: what it does ─────────────────────────────── */}
      <section className="border-t border-border/60 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Editorial header: title left, lede right */}
          <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <div className="text-label mb-3 text-primary">What it does</div>
              <h2 className="text-display-sm text-balance text-foreground">
                A front desk that{' '}
                <span className="text-voice">actually understands</span> your customers.
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-2">
              Not a chatbot that recites your FAQ. BAS classifies intent, pulls from your real knowledge,
              takes action, and knows when a human should take over.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            {BENTO.map((cell, i) => {
              const Visual = BENTO_VISUALS[cell.visual];
              return (
                <article
                  key={cell.title}
                  className={`group surface-raised card-hover flex flex-col justify-between gap-6 overflow-hidden rounded-2xl p-6 ${cell.span} animate-in-up`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div>
                    <div className="mb-4 flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 ease-out group-hover:scale-105">
                        <cell.icon className="h-4 w-4" />
                      </span>
                      <span className="text-label text-muted-foreground">{cell.label}</span>
                    </div>
                    <h3 className="text-subheading mb-1.5 text-foreground">{cell.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{cell.body}</p>
                  </div>
                  <div className="mt-auto">
                    <Visual />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works: editorial numbered rail ───────────── */}
      <section className="border-t border-border/60 bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="text-label mb-3 text-primary">How it works</div>
                <h2 className="text-display-sm text-balance text-foreground">
                  Live in <span className="text-voice">three steps.</span>
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                  Connect, configure, automate — most businesses finish their first setup before their
                  coffee cools.
                </p>
                <Link href="/signup" className="mt-6 inline-block">
                  <Button variant="outline" className="gap-1.5">
                    Start the setup <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <ol className="lg:col-span-8">
              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  className="group flex gap-6 border-b border-border/70 py-8 first:pt-0 last:border-b-0 sm:gap-10 animate-in-up"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <span className="font-display text-4xl font-medium leading-none text-muted-foreground/40 transition-colors duration-300 group-hover:text-primary/70 sm:text-5xl">
                    {s.n}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-subheading mb-1.5 text-foreground">{s.title}</h3>
                    <p className="max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Proof: pull quote ──────────────────────────────── */}
      <section className="border-t border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center animate-in-up">
            <span className="font-display text-6xl leading-none text-primary/40">“</span>
            <blockquote className="font-display -mt-6 text-2xl font-medium leading-snug text-foreground text-balance sm:text-[28px]">
              Before BAS, customers would message at night and wait until morning for an answer.
              Now they get prices, stock, and reservations instantly — we just handle the pickup.
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-center gap-3 text-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full brand-fill text-xs font-bold text-white">
                CU
              </span>
              <span className="font-medium text-foreground">Claudine U.</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-muted-foreground">Urban Threads, Kigali</span>
            </figcaption>
            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Early access pilot
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing: four tiers, one featured ───────────────── */}
      <section className="border-t border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <div className="text-label mb-3 text-primary">Pricing</div>
              <h2 className="text-display-sm text-balance text-foreground">
                Start free. <span className="text-voice">Upgrade</span> when chat pays for itself.
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-2">
              Every plan includes tenant-isolated data, the knowledge base and human handover. No setup fees,
              cancel any time.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_PLANS.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col rounded-lg border bg-card p-6 ${
                  p.highlight ? 'border-primary' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-label text-muted-foreground">{p.name}</span>
                  {p.highlight && <span className="badge-primary text-[9px]">Popular</span>}
                </div>
                <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
                  {p.price}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
                <ul className="mt-5 space-y-2 border-t border-border pt-5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-foreground/80">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-1">
                  <Link href="/signup" className="block">
                    <Button
                      variant={p.highlight ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {p.price === 'Free' ? 'Start free' : `Choose ${p.name}`}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials: three operators ───────────────────── */}
      <section className="border-t border-border/60 bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <div className="text-label mb-3 text-primary">From the counter</div>
            <h2 className="text-display-sm text-balance text-foreground">
              Owners who stopped <span className="text-voice">answering the same question.</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-lg border border-border bg-card p-6">
                <blockquote className="text-[15px] leading-relaxed text-foreground/85 text-pretty">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full brand-fill text-[10px] font-bold text-white">
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-foreground">{t.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ: plain-spoken answers ───────────────────────── */}
      <section className="border-t border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="text-label mb-3 text-primary">FAQ</div>
              <h2 className="text-display-sm text-balance text-foreground">
                Questions, <span className="text-voice">answered plainly.</span>
              </h2>
              <Link href="/faq" className="mt-5 inline-block">
                <Button variant="outline" className="gap-1.5">
                  Read all FAQs <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="border-t border-border lg:col-span-8">
              {HOME_FAQ.map((f) => (
                <details key={f.q} className="group border-b border-border py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-semibold text-foreground">
                    {f.q}
                    <Plus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA: ink panel ───────────────────────────── */}
      <section className="border-t border-border/60 pb-20 pt-4 sm:pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-chrome-border bg-chrome px-6 py-14 sm:px-14 sm:py-20">
            <div className="relative mx-auto max-w-2xl text-center">
              <div className="text-label mb-4" style={{ color: 'hsl(var(--sidebar-active))' }}>
                Ready when you are
              </div>
              <h2 className="text-display-sm text-balance text-white">
                Your next customer is{' '}
                <span className="text-voice" style={{ color: 'hsl(var(--sidebar-active))' }}>already typing.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-white/60">
                Set up BAS in minutes and let your AI front desk take the night shift.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="h-12 bg-background px-7 text-[15px] font-semibold text-foreground hover:bg-background/90 hover:text-foreground">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button size="lg" variant="outline" className="h-12 border-white/20 bg-transparent px-6 text-[15px] text-white hover:bg-white/10 hover:text-white">
                    Talk to a demo assistant
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer: ink band ───────────────────────────────── */}
      <footer className="border-t border-chrome-border bg-chrome py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg brand-fill">
                <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-sm font-bold tracking-[0.1em] text-chrome-fg">BAS</span>
              <span className="ml-2 text-xs text-chrome-muted">Business Automation System</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { href: '/features', label: 'Features' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
                { href: '/privacy', label: 'Privacy' },
                { href: '/terms', label: 'Terms' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="link-draw text-xs text-chrome-muted transition-colors hover:text-chrome-fg"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-chrome-muted">© 2025 BAS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
