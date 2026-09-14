'use client';

import { SiteLayout } from '@/components/public/site-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, BookOpen, Workflow, Users, ShoppingCart, CalendarDays, Plug, BarChart3, Headset, Bell } from 'lucide-react';

const FEATURES = [
  { icon: Bot, title: 'AI Customer Assistant', desc: 'Understands customer intent, retrieves your business knowledge, and answers accurately — without inventing information.' },
  { icon: BookOpen, title: 'Knowledge Engine', desc: 'Structured business knowledge — services, products, prices, policies, FAQs, hours. Enter it manually or import it from your website.' },
  { icon: Workflow, title: 'Workflow Automation', desc: 'Turn repetitive processes into workflows: detect intent, check rules, create orders and bookings, notify your team.' },
  { icon: Users, title: 'Customer Management', desc: 'Every conversation creates a customer record. See their orders, bookings, and requests in one profile.' },
  { icon: ShoppingCart, title: 'Orders', desc: 'Customers can request orders through chat. Your team reviews, confirms, and fulfills them.' },
  { icon: CalendarDays, title: 'Bookings', desc: 'Appointments for salons, clinics, consultants, and hotels — requested via chat, confirmed by your team.' },
  { icon: Plug, title: 'Integrations', desc: 'Web chat and website ingestion today. WhatsApp, email, e-commerce, and booking systems are on the roadmap.' },
  { icon: BarChart3, title: 'Analytics', desc: 'See conversations, orders, bookings, and automation activity across your business.' },
  { icon: Headset, title: 'Human Handover', desc: 'When the AI is unsure or a customer asks for a person, escalate to your staff with the full conversation context.' },
  { icon: Bell, title: 'Notifications', desc: 'Your team is notified the moment a customer places an order, requests a booking, or needs help.' },
];

export default function FeaturesPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Features</h1>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to automate customer conversations, orders, and operations — without replacing your existing systems.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border-slate-200 transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{f.title}</CardTitle>
                  <CardDescription className="mt-2 text-slate-600">{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}