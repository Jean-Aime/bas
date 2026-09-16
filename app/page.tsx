'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { HeroFlow } from '@/components/public/hero-flow';
import { AutomationDemo } from '@/components/public/automation-demo';
import { NetworkIllustration } from '@/components/ui/illustrations';
import {
  Zap, MessageSquare, Bot, Workflow, Globe, Building2, Shield,
  ArrowRight, CheckCircle2, Sparkles,
} from 'lucide-react';

const FEATURES = [
  { icon: Bot, title: 'AI Assistant', desc: 'Intelligent customer assistant that understands intent, retrieves business knowledge, and responds accurately.' },
  { icon: Workflow, title: 'Workflow Engine', desc: 'Build automated workflows for orders, bookings, lead capture, and human handover — no code required.' },
  { icon: MessageSquare, title: 'Omnichannel Chat', desc: 'Web chat today, WhatsApp and email tomorrow. One conversation system, multiple channels.' },
  { icon: Globe, title: 'Website Ingestion', desc: 'Connect your website URL and BAS extracts business knowledge automatically — review and edit anytime.' },
  { icon: Building2, title: 'Multi-Business', desc: 'Run multiple businesses from one account. Complete tenant isolation, no data leakage.' },
  { icon: Shield, title: 'Secure by Design', desc: 'Row-level security, audit logging, role-based access. Enterprise-grade from day one.' },
];

const STATS = [
  { value: '< 2s', label: 'Median AI response time' },
  { value: '24/7', label: 'Automated availability' },
  { value: '80%+', label: 'Conversations resolved without humans' },
  { value: '3 min', label: 'To configure your first workflow' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-white shadow-sm">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">BAS</span>
          </Link>
          <div className="hidden items-center gap-7 lg:flex">
            {[
              { href: '/features', label: 'Features' },
              { href: '/solutions', label: 'Solutions' },
              { href: '/integrations', label: 'Integrations' },
              { href: '/pricing', label: 'Pricing' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link href="/signup"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0 -z-10" />
        <div className="pointer-events-none absolute left-1/2 top-[-10rem] -z-10 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Business Automation Platform
            </div>
            <h1 className="animate-fade-in-up text-h1 sm:text-display">
              Automate your business.
              <br />
              <span className="text-gradient">Keep your systems.</span>
            </h1>
            <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground" style={{ animationDelay: '100ms' }}>
              BAS connects your existing tools — website, WhatsApp, e-commerce, booking systems —
              and uses AI to automate customer conversations, orders, bookings, and operations.
            </p>
            <div className="animate-fade-in-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '200ms' }}>
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Building <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See How BAS Works
                </Button>
              </Link>
            </div>
            <div className="animate-fade-in mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground" style={{ animationDelay: '300ms' }}>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Works with or without a website</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Multi-business support</span>
            </div>
          </div>

          {/* Automation flow */}
          <div className="mt-16 lg:mt-20">
            <HeroFlow />
          </div>
        </div>
      </section>

      {/* Interactive demo */}
      <section className="border-t bg-secondary/40 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-h2 sm:text-h1">Watch BAS answer in seconds</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              A customer asks a question. BAS understands it, checks your data, and responds — automatically.
            </p>
          </Reveal>
          <AutomationDemo />
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2 sm:text-h1">Everything you need to automate</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              From customer chat to workflow automation — one platform, every business type.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <Card className="card-hover h-full">
                  <CardHeader>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription className="mt-1.5">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band with illustration */}
      <section className="border-y bg-secondary/40 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="mx-auto w-full max-w-md lg:mx-0">
              <NetworkIllustration className="text-primary" />
            </Reveal>
            <div className="grid grid-cols-2 gap-8">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 70}>
                  <p className="text-4xl font-bold tracking-tight text-primary">{s.value}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2 sm:text-h1">How BAS works</h2>
            <p className="mt-3 text-lg text-muted-foreground">Connect, configure, automate — in three steps.</p>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { step: '01', title: 'Create your business', desc: 'Add your business info, services, products, hours, and policies. Works with or without a website.' },
              { step: '02', title: 'Configure knowledge', desc: 'Enter info manually or import from your website URL. BAS structures it for AI retrieval.' },
              { step: '03', title: 'Automate everything', desc: 'AI handles customer questions, orders, and bookings. Escalate to humans when needed.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 80}>
                <div className="relative border-l-2 border-primary/20 pl-6">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <p className="text-caption font-semibold uppercase tracking-widest text-primary">{s.step}</p>
                  <h3 className="mt-2 text-h3">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Industries strip */}
      <section className="border-t py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2 sm:text-h1">Built for every kind of business</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              One core, endless configurations — from clothing stores to hotels to NGOs.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { href: '/solutions/salons', label: 'Salons', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=60' },
              { href: '/solutions/hotels', label: 'Hotels', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=60' },
              { href: '/solutions/ecommerce', label: 'E-commerce', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=60' },
              { href: '/solutions/restaurants', label: 'Restaurants', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=60' },
            ].map((c, i) => (
              <Reveal key={c.href} delay={i * 60}>
                <Link href={c.href} className="group relative block overflow-hidden rounded-xl shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="relative h-40 sm:h-48">
                    <Image
                      src={c.image}
                      alt={`${c.label} using BAS`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white drop-shadow-sm">{c.label}</span>
                      <ArrowRight className="h-4 w-4 text-white/80 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 text-center">
            <Link href="/solutions">
              <Button variant="ghost">
                Explore all solutions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="card-highlight rounded-2xl border bg-gradient-to-b from-primary/5 to-transparent px-6 py-14 sm:px-14">
              <h2 className="text-h2 sm:text-h1">Ready to automate your business?</h2>
              <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
                Join BAS today and start automating customer conversations in minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">Talk to us</Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-semibold">BAS</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/features" className="transition-colors hover:text-foreground">Features</Link>
              <Link href="/solutions" className="transition-colors hover:text-foreground">Solutions</Link>
              <Link href="/integrations" className="transition-colors hover:text-foreground">Integrations</Link>
              <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
              <Link href="/about" className="transition-colors hover:text-foreground">About</Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">Contact</Link>
              <Link href="/faq" className="transition-colors hover:text-foreground">FAQ</Link>
              <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
            </div>
            <p className="text-sm text-muted-foreground">Business Automation System — v0.1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
