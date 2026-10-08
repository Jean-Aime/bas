'use client';

import Link from 'next/link';
import { SiteLayout } from '@/components/public/site-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    blurb: 'For solo businesses testing automation.',
    features: ['1 business', 'Web chat assistant', '10 conversations / month', 'Knowledge base', 'Community support'],
    highlight: false,
  },
  {
    name: 'Business',
    price: '$29 / mo',
    blurb: 'For growing businesses that live in chat.',
    features: ['Up to 3 businesses', 'Unlimited conversations', 'Orders & bookings', 'Workflow automation', 'Human handover', 'Email support'],
    highlight: true,
  },
  {
    name: 'Professional',
    price: '$79 / mo',
    blurb: 'For teams that need the full toolkit.',
    features: ['Up to 10 businesses', 'Team roles & permissions', 'Website ingestion', 'Advanced analytics', 'Priority support'],
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    blurb: 'For organizations with advanced needs.',
    features: ['Unlimited businesses', 'Custom integrations', 'Dedicated manager', 'SSO & compliance', 'SLA'],
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <SiteLayout>
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
            <p className="mt-4 text-lg text-slate-600">
              Prototype pricing — plans will be finalized before launch. Start free today.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <Card key={p.name} className={`border-slate-200 ${p.highlight ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-xl">{p.name}</CardTitle>
                  <div className="text-3xl font-bold tracking-tight">{p.price}</div>
                  <CardDescription className="mt-2">{p.blurb}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {p.features.map((f) => (
                    <p key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                    </p>
                  ))}
                  <Link href="/signup" className="mt-4 block">
                    <Button className="w-full" variant={p.highlight ? 'default' : 'outline'}>Get started</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}