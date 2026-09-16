'use client';

import { SiteLayout } from '@/components/public/site-layout';

const SECTIONS = [
  { title: 'Data we collect', body: 'Account details (name, email), business configuration you enter, and customer conversations processed on behalf of your business. We do not sell personal data.' },
  { title: 'How we use data', body: 'To provide the automation services you configure — answering customer questions, creating orders and bookings, and notifying your team.' },
  { title: 'Tenant isolation', body: 'Each business is a separate tenant. Customer data from one business is never accessible to another business or its staff.' },
  { title: 'Data retention', body: 'You can delete your business or account at any time. Deletion removes your configuration and associated records.' },
  { title: 'Contact', body: 'Privacy questions can be directed to the contact page. This policy is a placeholder for the production platform.' },
];

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Privacy policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: prototype v0.1 — placeholder</p>
          <div className="mt-10 space-y-8">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-semibold">{s.title}</h2>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}