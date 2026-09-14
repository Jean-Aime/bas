'use client';

import { SiteLayout } from '@/components/public/site-layout';
import { Zap, Globe, Building2, Shield } from 'lucide-react';

const VALUES = [
  { icon: Globe, title: 'Connect, don\'t replace', desc: 'Businesses keep the tools they love. BAS automates on top of them — or entirely without them.' },
  { icon: Building2, title: 'One core, every business', desc: 'The same platform powers a salon in Kigali and a hotel chain in Nairobi. Configuration, not custom builds.' },
  { icon: Zap, title: 'Honest automation', desc: 'The AI answers from your real business information. It never invents prices, availability, or policies.' },
  { icon: Shield, title: 'Secure by design', desc: 'Multi-tenant isolation, row-level security, audit logging, and role-based access from day one.' },
];

export default function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About BAS</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              BAS — the Business Automation System — is a multi-tenant platform that automates customer and
              operational processes for businesses of every size and type.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-slate-200 p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">{v.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-sm text-slate-500">
            BAS is currently in prototype (v0.1) — the foundation of the production platform.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}