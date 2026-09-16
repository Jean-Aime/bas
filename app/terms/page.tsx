'use client';

import { SiteLayout } from '@/components/public/site-layout';

const SECTIONS = [
  { title: 'Service', body: 'BAS is a business automation platform currently in prototype. You are responsible for the accuracy of the business information you configure, since the AI answers from it.' },
  { title: 'Your content', body: 'You retain ownership of your business configuration and data. You grant BAS the right to process it to provide the service.' },
  { title: 'AI responses', body: 'The assistant answers from your configured knowledge and rules. Verify critical transactional outcomes (orders, bookings, payments) before acting on them.' },
  { title: 'Integrations', body: 'Connected systems remain governed by their own terms. BAS only accesses systems you authorize.' },
  { title: 'Liability', body: 'To the extent permitted by law, BAS is provided as-is and liability is limited to the fees paid. These terms are a placeholder for the production platform.' },
];

export default function TermsPage() {
  return (
    <SiteLayout>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Terms and conditions</h1>
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