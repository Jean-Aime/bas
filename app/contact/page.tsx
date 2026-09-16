'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SiteLayout } from '@/components/public/site-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Reveal } from '@/components/ui/reveal';
import { Mail, MessageCircle, Clock, CheckCircle2, Send } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      {/* Hero with image */}
      <section className="relative overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=1600&q=70"
            alt="Laptop and notebook on a desk ready for correspondence"
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/40" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-background sm:text-5xl">Talk to us</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-background/70">
            Questions about BAS, a demo for your team, or a partnership — we read everything and reply within one business day.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-5">
            {/* Info panel */}
            <Reveal className="md:col-span-2">
              <div className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-gradient-to-b from-primary/5 to-transparent p-6 shadow-card">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">hello@bas-platform.example</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Chat</p>
                    <p className="text-sm text-muted-foreground">Try the customer assistant in the demo chat.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Response time</p>
                    <p className="text-sm text-muted-foreground">Within one business day.</p>
                  </div>
                </div>
                <div className="mt-auto rounded-xl border border-border bg-card p-4">
                  <p className="text-sm font-medium">Prefer to see it first?</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create a free account and test the AI assistant on your own business data in minutes.</p>
                </div>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal delay={80} className="md:col-span-3">
              <Card className="shadow-card">
                <CardContent className="p-6 sm:p-8">
                  {sent ? (
                    <div className="flex flex-col items-center py-14 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
                        <CheckCircle2 className="h-7 w-7 text-success" />
                      </div>
                      <p className="mt-4 text-lg font-medium">Message sent</p>
                      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                        Thank you — we&apos;ll get back to you within one business day.
                      </p>
                      <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>Send another</Button>
                    </div>
                  ) : (
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                          <Input id="name" name="name" required autoComplete="name" placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                        <Input id="subject" name="subject" required placeholder="How can we help?" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                        <Textarea id="message" name="message" required rows={6} placeholder="Tell us about your business and what you'd like to automate…" />
                      </div>
                      <Button type="submit" className="w-full sm:w-auto">
                        Send message <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
