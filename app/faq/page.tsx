'use client';

import { SiteLayout } from '@/components/public/site-layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQS = [
  {
    q: 'Do I need a website to use BAS?',
    a: 'No. BAS works for businesses with no digital presence at all — enter your services, prices, hours, and policies manually, and the AI assistant answers from that information.',
  },
  {
    q: 'Does BAS replace my existing software?',
    a: 'No. BAS connects to the systems you already use — website, e-commerce, WhatsApp, booking systems — and automates on top of them. Where nothing is connected, you configure business information directly.',
  },
  {
    q: 'Will the AI invent information it doesn\'t know?',
    a: 'No. The assistant only answers from the structured business knowledge you provide. If it doesn\'t know something — like live room availability — it asks for details and hands the request to your team instead of guessing.',
  },
  {
    q: 'Which channels does BAS support?',
    a: 'Web chat works today. WhatsApp, email, and other channels are architecturally planned and will be connected in later phases.',
  },
  {
    q: 'Is my business data isolated from other businesses?',
    a: 'Yes. Every business is a separate tenant with row-level security enforced at the database. Business A can never see Business B\'s data.',
  },
  {
    q: 'Can my team take over a conversation from the AI?',
    a: 'Yes. The AI escalates when the customer asks for a person, confidence is low, or a request is outside its capabilities. Your staff takes over with full conversation context.',
  },
  {
    q: 'Can I switch businesses without losing data?',
    a: 'Yes. One account can own many businesses, and you can switch between them from the dashboard. Each stays fully isolated.',
  },
];

export default function FaqPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Frequently asked questions</h1>
            <p className="mt-4 text-lg text-slate-600">Everything you need to know about BAS.</p>
          </div>
          <Accordion type="single" collapsible className="mt-12">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}