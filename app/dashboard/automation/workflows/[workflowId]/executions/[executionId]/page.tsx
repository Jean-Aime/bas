'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';

interface ExecutionDetail {
  id: string;
  workflow_id: string;
  status: string;
  trigger_data: Record<string, unknown>;
  result: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
}

interface ExecutionLog {
  id: string;
  step_name: string;
  step_index: number;
  status: string;
  message: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export default function ExecutionDetailPage() {
  const { workflowId, executionId } = useParams<{ workflowId: string; executionId: string }>();
  const { currentBusiness } = useBusiness();
  const [execution, setExecution] = useState<ExecutionDetail | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadExecution();
  }, [currentBusiness, executionId]);

  const loadExecution = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .eq('workflow_id', workflowId)
      .eq('business_id', currentBusiness.id)
      .maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setExecution(data as ExecutionDetail);
    const { data: logData } = await supabase
      .from('workflow_execution_logs')
      .select('*')
      .eq('execution_id', executionId)
      .eq('business_id', currentBusiness.id)
      .order('step_index');
    setLogs((logData || []) as ExecutionLog[]);
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading execution…" />;
  if (error || !execution) return <ErrorState message="This execution does not exist in the current business." onRetry={loadExecution} />;

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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Trigger input</CardTitle></CardHeader>
          <CardContent>
            <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">{JSON.stringify(execution.trigger_data || {}, null, 2)}</pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Result</CardTitle></CardHeader>
          <CardContent>
            <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">{JSON.stringify(execution.result || {}, null, 2)}</pre>
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