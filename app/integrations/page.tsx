'use client';

import Link from 'next/link';
import { SiteLayout } from '@/components/public/site-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { CheckCircle2, Clock, ArrowRight, Globe, MessageSquare, ShoppingCart, CalendarDays, Mail, Plug } from 'lucide-react';
import { getAllConnectorMetadata } from '@/lib/connectors/registry';

const CONNECTOR_ICONS: Record<string, typeof Globe> = {
  website: Globe,
  web_chat: MessageSquare,
  ecommerce: ShoppingCart,
  bookings: CalendarDays,
  email: Mail,
};

export default function PublicIntegrationsPage() {
  const connectors = getAllConnectorMetadata();
  const builtIn = connectors.filter((c) => c.status === 'connected');
  const upcoming = connectors.filter((c) => c.status !== 'connected');

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-2">
        <div className="bg-grid bg-grid-fade pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Connect the tools you <span className="text-gradient">already use</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                BAS slots into your existing stack — website, chat, commerce, and booking systems.
                We only list what actually works.
              </p>
            </Reveal>
          </div>

          {/* Icon band */}
          <Reveal delay={120} className="mt-14">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
              {[
                { icon: Globe, label: 'Website' },
                { icon: MessageSquare, label: 'Web chat' },
                { icon: ShoppingCart, label: 'E-commerce' },
                { icon: CalendarDays, label: 'Bookings' },
                { icon: Mail, label: 'Email' },
                { icon: Plug, label: 'More coming' },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-card">
                  <t.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Built in */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-h2">Available now</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {builtIn.map((c, i) => {
              const Icon = CONNECTOR_ICONS[c.type] ?? Plug;
              return (
                <Reveal key={c.type} delay={i * 60}>
                  <Card className="card-hover h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{c.displayName}</CardTitle>
                        </div>
                        <Badge className="bg-success-soft text-success-soft-fg"><CheckCircle2 className="mr-1 h-3 w-3" /> Built in</Badge>
                      </div>
                      <CardDescription className="mt-3">{c.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      {upcoming.length > 0 && (
        <section className="border-t bg-surface-2 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="text-h2">On the roadmap</h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((c, i) => {
                const Icon = CONNECTOR_ICONS[c.type] ?? Plug;
                return (
                  <Reveal key={c.type} delay={i * 60}>
                    <Card className="h-full opacity-90">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-lg">{c.displayName}</CardTitle>
                          </div>
                          <Badge variant="outline"><Clock className="mr-1 h-3 w-3" /> Soon</Badge>
                        </div>
                        <CardDescription className="mt-3">{c.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-h2 sm:text-h1">Missing a system you rely on?</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
              BAS works without any integration — enter your business information manually and start today.
            </p>
            <Link href="/signup" className="mt-6 inline-block">
              <Button size="lg">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
