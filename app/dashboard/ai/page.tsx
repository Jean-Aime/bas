'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, FlaskConical, Settings2, ShieldCheck } from 'lucide-react';

const SECTIONS = [
  { icon: Bot, title: 'Assistant configuration', desc: 'Provider, model, response behavior, and knowledge grounding.' },
  { icon: FlaskConical, title: 'Test playground', desc: 'Try questions against your business knowledge and see detected intent, confidence, and actions.' },
  { icon: Settings2, title: 'Confidence & escalation', desc: 'Set confidence thresholds and rules for human handover.' },
  { icon: ShieldCheck, title: 'Safety', desc: 'Guardrails so the AI never invents prices, availability, or policies.' },
];

export default function AiPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">Configure how the assistant behaves for your business.</p>
        </div>
        <Badge variant="outline">Active · grounded in your knowledge</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">{s.title}</CardTitle>
              <CardDescription>{s.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Coming soon</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        The assistant is already live in customer chat. This page will expose provider and behavior controls in a later phase.
      </p>
    </div>
  );
}