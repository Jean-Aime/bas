'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Database, Bot, Plug, Cog, Server, CheckCircle2, Circle } from 'lucide-react';

const CHECKS = [
  { label: 'Database', icon: Database, ok: true },
  { label: 'AI service', icon: Bot, ok: true },
  { label: 'Integrations', icon: Plug, ok: false },
  { label: 'Background jobs', icon: Cog, ok: false },
  { label: 'API status', icon: Server, ok: true },
];

export default function AdminHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System health</h1>
        <p className="text-muted-foreground">Live status of the platform services.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHECKS.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <c.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.ok ? 'Operational' : 'Not implemented in prototype'}</p>
                </div>
              </div>
              {c.ok ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Prototype status: the database and AI chat pipeline are operational. Background jobs and external
        integrations are part of later phases.
      </p>
    </div>
  );
}