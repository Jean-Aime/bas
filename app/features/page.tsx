'use client';

import { SiteLayout } from '@/components/public/site-layout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { NetworkIllustration, ChatIllustration, WorkflowIllustration, ChartIllustration } from '@/components/ui/illustrations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, BookOpen, Workflow, Users, ShoppingCart, CalendarDays, Plug, BarChart3, Headset, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  { icon: Bot, title: 'AI Customer Assistant', desc: 'Understands customer intent, retrieves your business knowledge, and answers accurately — without inventing information.' },
  { icon: BookOpen, title: 'Knowledge Engine', desc: 'Structured business knowledge — services, products, prices, policies, FAQs, hours. Enter it manually or import it from your website.' },
  { icon: Workflow, title: 'Workflow Automation', desc: 'Turn repetitive processes into workflows: detect intent, check rules, create orders and bookings, notify your team.' },
  { icon: Users, title: 'Customer Management', desc: 'Every conversation creates a customer record. See their orders, bookings, and requests in one profile.' },
  { icon: ShoppingCart, title: 'Orders', desc: 'Customers can request orders through chat. Your team reviews, confirms, and fulfills them.' },
  { icon: CalendarDays, title: 'Bookings', desc: 'Appointments for salons, clinics, consultants, and hotels — requested via chat, confirmed by your team.' },
  { icon: Plug, title: 'Integrations', desc: 'Web chat and website ingestion today. WhatsApp, email, e-commerce, and booking systems are on the roadmap.' },
  { icon: BarChart3, title: 'Analytics', desc: 'See conversations, orders, bookings, and automation activity across your business.' },
  { icon: Headset, title: 'Human Handover', desc: 'When the AI is unsure or a customer asks for a person, escalate to your staff with the full conversation context.' },
  { icon: Bell, title: 'Notifications', desc: 'Your team is notified the moment a customer places an order, requests a booking, or needs help.' },
];

/** Alternating showcase rows — each pairs a headline feature with a real visual. */
const SHOWCASE = [
  {
    eyebrow: 'Conversations',
    title: 'A front desk that never closes',
    desc: 'Customers ask in plain language. BAS understands intent, pulls from your structured knowledge — services, prices, policies — and answers in seconds, any hour, any day.',
    Illustration: ChatIllustration,
    tone: 'text-primary',
    wrap: 'bg-primary/5',
  },
  {
    eyebrow: 'Automation',
    title: 'From question to completed action',
    desc: 'Detect intent, check your rules, create the order or booking, notify your team. Workflows run end-to-end — and hand over to a human the moment it\'s needed.',
    Illustration: WorkflowIllustration,
    tone: 'text-info',
    wrap: 'bg-info/5',
    flip: true,
  },
  {
    eyebrow: 'Intelligence',
    title: 'Your operations, finally measurable',
    desc: 'Conversation volume, automation rate, orders and bookings — live on one dashboard, so you can see exactly what the platform handles for you.',
    Illustration: ChartIllustration,
    tone: 'text-success',
    wrap: 'bg-success/5',
  },
];

export default function FeaturesPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-2">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Everything you need to <span className="text-gradient">automate</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Customer conversations, orders, bookings, operations — one platform that connects
                to the tools you already use, or runs entirely on its own.
              </p>
            </Reveal>
          </div>
          <Reveal delay={120} className="mx-auto mt-12 max-w-3xl">
            <NetworkIllustration className="text-primary" />
          </Reveal>
        </div>
      </section>

      {/* Showcase rows */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl space-y-20 px-4 sm:px-6 lg:px-8 lg:space-y-28">
          {SHOWCASE.map((s, i) => (
            <Reveal key={s.eyebrow}>
              <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
                <div className={s.flip ? 'lg:order-2' : ''}>
                  <p className="text-caption font-semibold uppercase tracking-widest text-primary">{s.eyebrow}</p>
                  <h2 className="mt-2 text-h2 sm:text-h1">{s.title}</h2>
                  <p className="mt-4 max-w-lg text-lg text-muted-foreground">{s.desc}</p>
                  <Link href="/signup" className="mt-6 inline-block">
                    <Button variant="outline">
                      Try it free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className={`rounded-2xl border border-border p-6 sm:p-10 ${s.wrap} ${s.flip ? 'lg:order-1' : ''}`}>
                  <s.Illustration className={s.tone} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Full feature grid */}
      <section className="border-t bg-surface-2 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2 sm:text-h1">And everything under the hood</h2>
            <p className="mt-3 text-lg text-muted-foreground">Ten core capabilities, one coherent system.</p>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 60}>
                <Card className="card-hover h-full">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{f.title}</CardTitle>
                    <CardDescription className="mt-2">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 text-center">
            <Link href="/signup">
              <Button size="lg">Start building free <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
