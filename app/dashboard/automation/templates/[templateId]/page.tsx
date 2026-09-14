'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WORKFLOW_TEMPLATES } from '@/lib/workflow/templates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Workflow } from 'lucide-react';
import { EmptyState } from '@/components/ui/page-states';

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const template = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/automation/templates">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> All templates</Button>
        </Link>
        <EmptyState icon={Workflow} title="Template not found" description="This template does not exist in the library." actionHref="/dashboard/automation/templates" actionLabel="Browse templates" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/automation/templates">
          <Button variant="ghost" size="icon" aria-label="Back to templates"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trigger</CardTitle>
            <CardDescription>When this workflow starts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline">{template.trigger_type}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Intent</span><Badge variant="outline">{template.trigger_intent}</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Steps ({template.steps.length})</CardTitle>
            <CardDescription>The sequence executed when triggered.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {template.steps.map((s, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                  <span className="font-medium">{s.name}</span>
                  <Badge variant="secondary" className="ml-auto">{s.type.replace(/_/g, ' ')}</Badge>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Apply this template to your business from the Automation page — the same template adapts to any business configuration.
      </p>
    </div>
  );
}