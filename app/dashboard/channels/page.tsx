'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, MessageCircle, Mail, CheckCircle2, Clock } from 'lucide-react';

const CHANNELS = [
  { icon: MessageSquare, name: 'Web Chat', status: 'connected', desc: 'Built into BAS — embed the assistant on any page or use the hosted chat.', requirement: null },
  { icon: MessageCircle, name: 'WhatsApp', status: 'coming_soon', desc: 'Reach customers where they already chat.', requirement: 'Requires WhatsApp Business API approval and connector development.' },
  { icon: Mail, name: 'Email', status: 'coming_soon', desc: 'Handle support and order email conversations.', requirement: 'Requires mailbox connection (IMAP/SMTP or provider API).' },
];

export default function ChannelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Channels</h1>
        <p className="text-muted-foreground">The channels your customers use to reach your business. One conversation system, many channels.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {CHANNELS.map((c) => (
          <Card key={c.name}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                {c.status === 'connected' ? (
                  <Badge className="bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" /> Connected</Badge>
                ) : (
                  <Badge variant="outline"><Clock className="mr-1 h-3 w-3" /> Coming soon</Badge>
                )}
              </div>
              <CardTitle className="text-lg">{c.name}</CardTitle>
              <CardDescription>{c.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              {c.requirement ? (
                <p className="text-xs text-muted-foreground">{c.requirement}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Available now. Open the customer chat from the sidebar.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}