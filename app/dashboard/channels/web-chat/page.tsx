'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle2, ExternalLink } from 'lucide-react';

export default function WebChatConfigPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Web Chat</h1>
          <p className="text-muted-foreground">The customer assistant, built into BAS.</p>
        </div>
        <Badge className="bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" /> Connected</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> How it works</CardTitle>
          <CardDescription>No external credentials needed — the web chat is part of BAS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Customers pick your business from the hosted chat or open it directly at a business link
            (e.g. <span className="font-medium text-foreground">/chat/your-business-slug</span>). The assistant answers from your
            knowledge and creates orders, bookings, and requests through workflows.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/chat" target="_blank">
              <Button size="sm"><ExternalLink className="mr-2 h-4 w-4" /> Open customer chat</Button>
            </Link>
            <Link href="/dashboard/conversations">
              <Button size="sm" variant="outline">View conversations</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}