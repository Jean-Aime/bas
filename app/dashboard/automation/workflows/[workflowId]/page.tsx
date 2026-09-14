'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Workflow, Pencil, Activity, Play } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';

interface WorkflowDetail {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_condition: Record<string, unknown>;
  steps: { name: string; type: string }[];
  status: string;
  version: number;
}

export default function WorkflowDetailPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const { currentBusiness } = useBusiness();
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [executionCount, setExecutionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadWorkflow();
  }, [currentBusiness, workflowId]);

  const loadWorkflow = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('workflows').select('*').eq('id', workflowId).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setWorkflow(data as WorkflowDetail);
    const { count } = await supabase
      .from('workflow_executions')
      .select('id', { count: 'exact', head: true })
      .eq('workflow_id', workflowId)
      .eq('business_id', currentBusiness.id);
    setExecutionCount(count || 0);
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading workflow…" />;
  if (error || !workflow) return <ErrorState message="This workflow does not exist in the current business." onRetry={loadWorkflow} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/automation">
          <Button variant="ghost" size="icon" aria-label="Back to automation"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>
          <p className="text-sm text-muted-foreground">Version {workflow.version} · {workflow.description || 'No description'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>{workflow.status}</Badge>
          <Link href={`/dashboard/automation/workflows/${workflow.id}/edit`}>
            <Button size="sm" variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Play className="h-4 w-4" /> Trigger</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline">{workflow.trigger_type}</Badge></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Condition</span>
              <span className="font-medium">{Object.entries(workflow.trigger_condition || {}).map(([k, v]) => `${k}: ${String(v)}`).join(', ') || '—'}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Executions</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total runs</span><span className="font-medium">{executionCount}</span></div>
            <Link href={`/dashboard/automation/workflows/${workflow.id}/executions`} className="inline-block text-primary hover:underline">
              View execution history →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Workflow className="h-4 w-4" /> Steps ({workflow.steps.length})</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {workflow.steps.map((s, i) => (
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
  );
}