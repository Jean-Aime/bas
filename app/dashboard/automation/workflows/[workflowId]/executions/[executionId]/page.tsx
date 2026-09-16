'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { fetchExecutionDetail, fetchWorkflowForBusiness } from '@/lib/services/execution-service';
import { WorkflowVisualizer } from '@/components/dashboard/workflow-visualizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';

export default function ExecutionDetailPage() {
  const { workflowId, executionId } = useParams<{ workflowId: string; executionId: string }>();
  const { currentBusiness } = useBusiness();
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchExecutionDetail>>>(null);
  const [workflow, setWorkflow] = useState<Awaited<ReturnType<typeof fetchWorkflowForBusiness>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadExecution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusiness, executionId]);

  const loadExecution = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const result = await fetchExecutionDetail(currentBusiness.id, String(workflowId), String(executionId));
    if (!result) {
      setError(true);
      setLoading(false);
      return;
    }
    setDetail(result);
    setWorkflow(await fetchWorkflowForBusiness(currentBusiness.id, String(workflowId)));
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading execution…" />;
  if (error || !detail) return <ErrorState message="This execution does not exist in the current business." onRetry={loadExecution} />;

  const execution = detail.execution;
  const logs = detail.logs;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/automation/workflows/${workflowId}/executions`}>
          <Button variant="ghost" size="icon" aria-label="Back to executions"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Execution</h1>
          <p className="text-sm text-muted-foreground">Started {new Date(execution.started_at).toLocaleString()}</p>
        </div>
        <Badge className="ml-auto" variant={execution.status === 'completed' ? 'default' : execution.status === 'failed' ? 'destructive' : 'secondary'}>
          {execution.status}
        </Badge>
      </div>

      {/* Visual pipeline with true per-step playback from execution logs */}
      {workflow && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Pipeline replay</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowVisualizer
              workflow={{ trigger_type: workflow.trigger_type, trigger_condition: workflow.trigger_condition, steps: workflow.steps }}
              logs={logs.map((l) => ({ step_index: l.step_index, status: l.status }))}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Trigger input</CardTitle></CardHeader>
          <CardContent>
            <pre className="max-h-40 overflow-auto rounded-lg bg-surface-2 p-3 text-xs">{JSON.stringify(execution.trigger_data || {}, null, 2)}</pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Result</CardTitle></CardHeader>
          <CardContent>
            <pre className="max-h-40 overflow-auto rounded-lg bg-surface-2 p-3 text-xs">{JSON.stringify(execution.result || {}, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Step log</CardTitle></CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No step logs recorded for this execution.</p>
          ) : (
            <ol className="space-y-2">
              {logs.map((l) => (
                <li key={l.id} className="flex items-start gap-3 rounded-lg border px-3 py-2">
                  {l.status === 'completed' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : l.status === 'failed' ? (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  ) : (
                    <Activity className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{l.step_name}</span>
                      <Badge variant="outline">{l.status}</Badge>
                    </div>
                    {l.message && <p className="mt-0.5 text-xs text-muted-foreground">{l.message}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleTimeString()}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}