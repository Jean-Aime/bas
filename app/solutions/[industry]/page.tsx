'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SiteLayout } from '@/components/public/site-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, Bot, Workflow, Globe } from 'lucide-react';

const INDUSTRIES: Record<string, { label: string; tagline: string; examples: string[]; capabilities: string[] }> = {
  ecommerce: {
    label: 'E-commerce',
    tagline: 'Answer product questions and capture order requests from every channel.',
    examples: ['Product availability and price inquiries', 'Order requests from chat', 'Policy and delivery questions'],
    capabilities: ['AI product assistant', 'Order request workflows', 'Website knowledge import'],
  },
  retail: {
    label: 'Retail',
    tagline: 'Turn customer questions into conversations your team can act on.',
    examples: ['Stock and price checks', 'Store hours and location questions', 'Order and pickup requests'],
    capabilities: ['AI customer assistant', 'Order request workflows', 'Multi-location support'],
  },
  restaurants: {
    label: 'Restaurants',
    tagline: 'Handle menu questions and reservation requests around the clock.',
    examples: ['Menu, price, and allergen questions', 'Reservation requests', 'Delivery and hours information'],
    capabilities: ['AI customer assistant', 'Booking request workflows', 'Policies and FAQs'],
  },
  salons: {
    label: 'Salons',
    tagline: 'Run a salon without a website — customers find you, chat, and book.',
    examples: ['Service and price questions', 'Appointment requests', 'Opening hours and location'],
    capabilities: ['No-website setup', 'Appointment workflows', 'AI customer assistant'],
  },
  hotels: {
    label: 'Hotels',
    tagline: 'Answer room questions and collect booking requests 24/7.',
    examples: ['Room types and rates', 'Amenities and policies', 'Booking requests'],
    capabilities: ['AI customer assistant', 'Booking request workflows', 'Structured knowledge'],
  },
  tourism: {
    label: 'Tourism',
    tagline: 'Promote tours and packages, capture inquiries, and request bookings.',
    examples: ['Tour and package questions', 'Availability inquiries', 'Booking requests'],
    capabilities: ['AI customer assistant', 'Booking request workflows', 'Website knowledge import'],
  },
  'professional-services': {
    label: 'Professional services',
    tagline: 'Quality your leads and schedule consultations automatically.',
    examples: ['Service and pricing questions', 'Consultation appointment requests', 'Lead capture'],
    capabilities: ['AI customer assistant', 'Appointment workflows', 'Lead capture'],
  },
  ngos: {
    label: 'NGOs',
    tagline: 'Answer program questions and direct supporters to the right team.',
    examples: ['Program and eligibility FAQs', 'Supporter requests', 'Human handover'],
    capabilities: ['AI customer assistant', 'FAQ workflows', 'Human handover'],
  },
  other: {
    label: 'Other businesses',
    tagline: 'Whatever you run, BAS adapts to your business information and rules.',
    examples: ['Custom FAQs and policies', 'Customer requests and inquiries', 'Human handover'],
    capabilities: ['AI customer assistant', 'Custom workflows', 'Structured knowledge'],
  },
};

export default function IndustrySolutionPage() {
  const { industry } = useParams<{ industry: string }>();
  const data = INDUSTRIES[industry];

  if (!data) {
    return (
      <SiteLayout>
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Industry not found</h1>
            <p className="mt-4 text-slate-600">We don&apos;t have a dedicated page for &quot;{industry}&quot; yet — but BAS still works for it.</p>
            <Link href="/solutions" className="mt-8 inline-block">
              <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> All solutions</Button>
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link href="/solutions" className="text-sm font-medium text-primary hover:underline">
            ← All solutions
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">BAS for {data.label}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">{data.tagline}</p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> What BAS automates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.examples.map((e) => (
                  <p key={e} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {e}
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> Capabilities</CardTitle>
                <CardDescription>From the same BAS core — configured for {data.label.toLowerCase()}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.capabilities.map((c) => (
                  <p key={c} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {c}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-slate-900 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white">Works with or without a website</h2>
            <p className="max-w-xl text-slate-400">
              Connect your website and BAS imports your knowledge automatically — or enter everything manually.
              Many businesses run fully on WhatsApp and phone.
            </p>
            <Link href="/signup">
              <Button size="lg">Start free <ArrowLeft className="ml-2 h-4 w-4 rotate-180" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}