'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { SiteLayout } from '@/components/public/site-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { ArrowLeft, ArrowRight, CheckCircle2, Bot, Workflow, Globe, Sparkles } from 'lucide-react';

const INDUSTRIES: Record<string, {
  label: string;
  tagline: string;
  image: string;
  imageAlt: string;
  gradient: string;
  examples: string[];
  capabilities: string[];
}> = {
  ecommerce: {
    label: 'E-commerce',
    tagline: 'Answer product questions and capture order requests from every channel.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Customer paying at a modern checkout counter',
    gradient: 'from-blue-600/80 to-blue-900/60',
    examples: ['Product availability and price inquiries', 'Order requests from chat', 'Policy and delivery questions'],
    capabilities: ['AI product assistant', 'Order request workflows', 'Website knowledge import'],
  },
  retail: {
    label: 'Retail',
    tagline: 'Turn customer questions into conversations your team can act on.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Bright modern retail store interior',
    gradient: 'from-sky-600/80 to-indigo-900/60',
    examples: ['Stock and price checks', 'Store hours and location questions', 'Order and pickup requests'],
    capabilities: ['AI customer assistant', 'Order request workflows', 'Multi-location support'],
  },
  restaurants: {
    label: 'Restaurants',
    tagline: 'Handle menu questions and reservation requests around the clock.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Warmly lit restaurant interior with set tables',
    gradient: 'from-amber-600/80 to-orange-900/60',
    examples: ['Menu, price, and allergen questions', 'Reservation requests', 'Delivery and hours information'],
    capabilities: ['AI customer assistant', 'Booking request workflows', 'Policies and FAQs'],
  },
  salons: {
    label: 'Salons',
    tagline: 'Run a salon without a website — customers find you, chat, and book.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Stylist working in a bright modern salon',
    gradient: 'from-rose-600/80 to-fuchsia-900/60',
    examples: ['Service and price questions', 'Appointment requests', 'Opening hours and location'],
    capabilities: ['No-website setup', 'Appointment workflows', 'AI customer assistant'],
  },
  hotels: {
    label: 'Hotels',
    tagline: 'Answer room questions and collect booking requests 24/7.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Elegant hotel lobby with warm evening lighting',
    gradient: 'from-indigo-600/80 to-blue-900/60',
    examples: ['Room types and rates', 'Amenities and policies', 'Booking requests'],
    capabilities: ['AI customer assistant', 'Booking request workflows', 'Structured knowledge'],
  },
  tourism: {
    label: 'Tourism',
    tagline: 'Promote tours and packages, capture inquiries, and request bookings.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Traveler overlooking a mountain valley at sunrise',
    gradient: 'from-teal-600/80 to-emerald-900/60',
    examples: ['Tour and package questions', 'Availability inquiries', 'Booking requests'],
    capabilities: ['AI customer assistant', 'Booking request workflows', 'Website knowledge import'],
  },
  'professional-services': {
    label: 'Professional services',
    tagline: 'Qualify your leads and schedule consultations automatically.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Modern professional office meeting space',
    gradient: 'from-slate-700/80 to-slate-900/60',
    examples: ['Service and pricing questions', 'Consultation appointment requests', 'Lead capture'],
    capabilities: ['AI customer assistant', 'Appointment workflows', 'Lead capture'],
  },
  ngos: {
    label: 'NGOs',
    tagline: 'Answer program questions and direct supporters to the right team.',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Volunteers working together on a community project',
    gradient: 'from-green-600/80 to-emerald-900/60',
    examples: ['Program and eligibility FAQs', 'Supporter requests', 'Human handover'],
    capabilities: ['AI customer assistant', 'FAQ workflows', 'Human handover'],
  },
  other: {
    label: 'Other businesses',
    tagline: 'Whatever you run, BAS adapts to your business information and rules.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=70',
    imageAlt: 'Business owner working in a flexible modern office',
    gradient: 'from-blue-700/80 to-slate-900/60',
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
            <p className="mt-4 text-muted-foreground">We don&apos;t have a dedicated page for &quot;{industry}&quot; yet — but BAS still works for it.</p>
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
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <Image
            src={data.image}
            alt={data.imageAlt}
            fill
            priority
            className="object-cover opacity-60"
            sizes="100vw"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${data.gradient} mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/30" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <Link href="/solutions" className="inline-flex items-center gap-1.5 text-sm font-medium text-background/80 transition-colors hover:text-background">
            <ArrowLeft className="h-4 w-4" /> All solutions
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-background/25 bg-background/10 px-3 py-1 text-xs font-medium text-background backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> BAS for {data.label}
          </div>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-background sm:text-5xl">
            {data.tagline}
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-background/30 bg-background/10 text-background backdrop-blur-sm hover:bg-background/20 hover:text-background">
                Talk to us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="bg-surface-2 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> What BAS automates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.examples.map((e) => (
                    <p key={e} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {e}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={80}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> Capabilities</CardTitle>
                  <CardDescription>From the same BAS core — configured for {data.label.toLowerCase()}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.capabilities.map((c) => (
                    <p key={c} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {c}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </Reveal>
          </div>

          <Reveal delay={120} className="mt-12">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-foreground px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-background">Works with or without a website</h2>
              <p className="max-w-xl text-background/70">
                Connect your website and BAS imports your knowledge automatically — or enter everything manually.
                Many businesses run fully on WhatsApp and phone.
              </p>
              <Link href="/signup">
                <Button size="lg">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
