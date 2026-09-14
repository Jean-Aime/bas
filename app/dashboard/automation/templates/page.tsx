'use client';

import { WORKFLOW_TEMPLATES } from '@/lib/workflow/templates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow } from 'lucide-react';

export default function AutomationTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automation templates</h1>
        <p className="text-muted-foreground">
          Reusable workflow templates. The same template adapts to any business — only the configuration and connectors change.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORKFLOW_TEMPLATES.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">{t.name}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Trigger</span>
                <Badge variant="outline">{t.trigger_type}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Intent</span>
                <Badge variant="outline">{t.trigger_intent}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Steps</span>
                <span className="font-medium">{t.steps.length}</span>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                {t.steps.map((s) => s.name).join(' → ')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}