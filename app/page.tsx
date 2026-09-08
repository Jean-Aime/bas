'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, MessageSquare, Bot, Workflow, Globe, Building2, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">BAS</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Business Automation Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Automate your business.<br />
              <span className="text-primary">Keep your systems.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
              BAS connects your existing tools — website, WhatsApp, e-commerce, booking systems —
              and uses AI to automate customer conversations, orders, bookings, and operations.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Works with or without a website</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Multi-business support</span>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 transform-gpu blur-3xl">
            <div className="h-[400px] w-[800px] rounded-full bg-primary/10" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to automate</h2>
            <p className="mt-4 text-lg text-slate-600">
              From customer chat to workflow automation — one platform, every business type.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bot, title: 'AI Assistant', desc: 'Intelligent customer assistant that understands intent, retrieves business knowledge, and responds accurately.' },
              { icon: Workflow, title: 'Workflow Engine', desc: 'Build automated workflows for orders, bookings, lead capture, and human handover — no code required.' },
              { icon: MessageSquare, title: 'Omnichannel Chat', desc: 'Web chat today, WhatsApp and email tomorrow. One conversation system, multiple channels.' },
              { icon: Globe, title: 'Website Ingestion', desc: 'Connect your website URL and BAS extracts business knowledge automatically — review and edit anytime.' },
              { icon: Building2, title: 'Multi-Business', desc: 'Run multiple businesses from one account. Complete tenant isolation, no data leakage.' },
              { icon: Shield, title: 'Secure by Design', desc: 'Row-level security, audit logging, role-based access. Enterprise-grade from day one.' },
            ].map((f) => (
              <Card key={f.title} className="border-slate-200 transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{f.title}</CardTitle>
                  <CardDescription className="mt-2 text-slate-600">{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How BAS works</h2>
            <p className="mt-4 text-lg text-slate-600">Connect, configure, automate — in three steps.</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Create your business', desc: 'Add your business info, services, products, hours, and policies. Works with or without a website.' },
              { step: '02', title: 'Configure knowledge', desc: 'Enter info manually or import from your website URL. BAS structures it for AI retrieval.' },
              { step: '03', title: 'Automate everything', desc: 'AI handles customer questions, orders, and bookings. Escalate to humans when needed.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-5xl font-bold text-primary/20">{s.step}</div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to automate your business?</h2>
          <p className="mt-4 text-lg text-slate-600">Join BAS today and start automating customer conversations in minutes.</p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-semibold">BAS</span>
            </div>
            <p className="text-sm text-slate-400">Business Automation System — v0.1 Prototype</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
