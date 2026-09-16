'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SiteLayout } from '@/components/public/site-layout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { Zap, Globe, Building2, Shield, ArrowRight } from 'lucide-react';

const VALUES = [
  { icon: Globe, title: 'Connect, don\'t replace', desc: 'Businesses keep the tools they love. BAS automates on top of them — or entirely without them.' },
  { icon: Building2, title: 'One core, every business', desc: 'The same platform powers a salon in Kigali and a hotel chain in Nairobi. Configuration, not custom builds.' },
  { icon: Zap, title: 'Honest automation', desc: 'The AI answers from your real business information. It never invents prices, availability, or policies.' },
  { icon: Shield, title: 'Secure by design', desc: 'Multi-tenant isolation, row-level security, audit logging, and role-based access from day one.' },
];

const BELIEFS = [
  {
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=70',
    imageAlt: 'Small business owner working on a laptop in their shop',
    eyebrow: 'The problem',
    title: 'Small teams lose customers to slow replies',
    body: 'A customer messages at 9pm about stock. By the time the owner replies the next morning, they\'ve bought elsewhere. Missed messages are missed revenue — and hiring a 24/7 team isn\'t realistic for most businesses.',
    flip: false,
  },
  {
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=70',
    imageAlt: 'Team collaborating around laptops in a modern workspace',
    eyebrow: 'Our answer',
    title: 'Automation that knows your business',
    body: 'BAS holds your real services, prices, policies, and rules — then answers, orders, and books on your behalf. It never invents information, and it hands over to you the moment a human should step in.',
    flip: true,
  },
];

export default function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=70"
            alt="Modern business district at dusk"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/40" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          <h1 className="text-4xl font-bold tracking-tight text-background sm:text-5xl">
            Automation for businesses that don&apos;t have a tech team
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-background/70">
            BAS — the Business Automation System — is a multi-tenant platform that automates customer
            and operational processes for businesses of every size and type.
          </p>
        </div>
      </section>

      {/* Story rows */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8 lg:space-y-24">
          {BELIEFS.map((b) => (
            <Reveal key={b.eyebrow}>
              <div className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14`}>
                <div className={`overflow-hidden rounded-2xl shadow-card ${b.flip ? 'lg:order-2' : ''}`}>
                  <div className="relative h-64 sm:h-80">
                    <Image
                      src={b.image}
                      alt={b.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <div className={b.flip ? 'lg:order-1' : ''}>
                  <p className="text-caption font-semibold uppercase tracking-widest text-primary">{b.eyebrow}</p>
                  <h2 className="mt-2 text-h2">{b.title}</h2>
                  <p className="mt-4 max-w-lg text-lg text-muted-foreground">{b.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="border-t bg-surface-2 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className="text-h2 sm:text-h1">What we optimize for</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 70}>
                <div className="card-hover h-full rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-h4">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14">
            <div className="card-highlight rounded-2xl border bg-gradient-to-b from-primary/5 to-transparent px-6 py-12 text-center">
              <h3 className="text-h3">Building the future of business operations</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                BAS is currently in prototype (v0.1) — the foundation of the production platform.
              </p>
              <Link href="/signup" className="mt-6 inline-block">
                <Button size="lg">Join the early access <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
