'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SiteLayout } from '@/components/public/site-layout';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { ArrowRight } from 'lucide-react';

const INDUSTRIES = [
  {
    slug: 'ecommerce', label: 'E-commerce',
    desc: 'Product inquiries, availability, and order requests — connected to your catalog.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=60',
  },
  {
    slug: 'retail', label: 'Retail',
    desc: 'Answer product and price questions from customers on any channel.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=60',
  },
  {
    slug: 'restaurants', label: 'Restaurants',
    desc: 'Menus, opening hours, reservations, and order requests.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=60',
  },
  {
    slug: 'salons', label: 'Salons',
    desc: 'Services, prices, and appointment requests — no website required.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=60',
  },
  {
    slug: 'hotels', label: 'Hotels',
    desc: 'Rooms, amenities, policies, and stay inquiries.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60',
  },
  {
    slug: 'tourism', label: 'Tourism',
    desc: 'Tours, packages, availability, and booking requests.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60',
  },
  {
    slug: 'professional-services', label: 'Professional services',
    desc: 'Consultations, pricing, and appointment scheduling.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=60',
  },
  {
    slug: 'ngos', label: 'NGOs',
    desc: 'Program information, FAQs, and supporter requests.',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=60',
  },
  {
    slug: 'other', label: 'Other businesses',
    desc: 'Whatever you run — BAS adapts to your information and rules.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=60',
  },
];

export default function SolutionsPage() {
  return (
    <SiteLayout>
      <section className="bg-surface-2 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">One platform, every business</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              The same BAS core powers a clothing store, a salon, a hotel, a restaurant, or an NGO.
              You configure your business information once; the AI and workflows adapt.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((i, idx) => (
              <Reveal key={i.slug} delay={idx * 50}>
                <Link href={`/solutions/${i.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-card-hover">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={i.image}
                        alt={`${i.label} business`}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                      <h2 className="absolute bottom-3 left-4 text-lg font-semibold text-white drop-shadow-sm">
                        {i.label}
                      </h2>
                    </div>
                    <div className="p-5">
                      <p className="min-h-[2.5rem] text-sm text-muted-foreground">{i.desc}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Learn more
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* CTA strip */}
          <Reveal className="mt-14">
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-8 shadow-card sm:flex-row sm:px-10">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Your industry not listed?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  BAS adapts to any business — configure your rules and knowledge once.
                </p>
              </div>
              <Link href="/signup" className="shrink-0">
                <Button size="lg">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
