'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MailCheck } from 'lucide-react';

export default function HelpContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact support</h1>
        <p className="text-muted-foreground">We reply within one business day.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send a message</CardTitle>
          <CardDescription>Include the business name so we can look it up.</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <MailCheck className="h-10 w-10 text-success" />
              <p className="font-medium">Message sent!</p>
              <p className="text-sm text-muted-foreground">We&apos;ll get back to you shortly.</p>
              <Button variant="outline" onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
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
              <Button type="submit">Send message</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}