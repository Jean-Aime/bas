'use client';

import Link from 'next/link';
import { SiteLayout } from '@/components/public/site-layout';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const INDUSTRIES = [
  { slug: 'ecommerce', label: 'E-commerce', desc: 'Product inquiries, availability, and order requests — connected to your catalog.' },
  { slug: 'retail', label: 'Retail', desc: 'Answer product and price questions from customers on any channel.' },
  { slug: 'restaurants', label: 'Restaurants', desc: 'Menus, opening hours, reservations, and order requests.' },
  { slug: 'salons', label: 'Salons', desc: 'Services, prices, and appointment requests — no website required.' },
  { slug: 'hotels', label: 'Hotels', desc: 'Rooms, amenities, policies, and stay inquiries.' },
  { slug: 'tourism', label: 'Tourism', desc: 'Tours, packages, availability, and booking requests.' },
  { slug: 'professional-services', label: 'Professional services', desc: 'Consultations, pricing, and appointment scheduling.' },
  { slug: 'ngos', label: 'NGOs', desc: 'Program information, FAQs, and supporter requests.' },
  { slug: 'other', label: 'Other businesses', desc: 'Whatever you run — BAS adapts to your information and rules.' },
];

export default function SolutionsPage() {
  return (
    <SiteLayout>
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">One platform, every business</h1>
            <p className="mt-4 text-lg text-slate-600">
              The same BAS core powers a clothing store, a salon, a hotel, a restaurant, or an NGO.
              You configure your business information once; the AI and workflows adapt.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((i) => (
              <Link key={i.slug} href={`/solutions/${i.slug}`}>
                <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-semibold">{i.label}</h2>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{i.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}