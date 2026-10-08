'use client';

import { useState } from 'react';
import { SiteLayout } from '@/components/public/site-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contact us</h1>
            <p className="mt-4 text-lg text-slate-600">Questions about BAS? We&apos;d love to hear from you.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-5">
            <Card className="md:col-span-2">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">hello@bas-platform.example</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Chat</p>
                    <p className="text-sm text-muted-foreground">Try the customer assistant in the demo chat.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Response time</p>
                    <p className="text-sm text-muted-foreground">We reply within one business day.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardContent className="p-6">
                {sent ? (
                  <div className="py-12 text-center">
                    <p className="text-lg font-medium">Message sent!</p>
                    <p className="mt-2 text-sm text-muted-foreground">Thank you — we&apos;ll get back to you shortly.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>Send another</Button>
                  </div>
                ) : (
                  <form
                    className="space-y-4"
                    onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" required placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required placeholder="you@example.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" required placeholder="How can we help?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" required rows={5} placeholder="Tell us more…" />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto">Send message</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}