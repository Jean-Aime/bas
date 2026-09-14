'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Activity, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/page-states';

interface Execution {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  trigger_data: Record<string, unknown>;
}

export default function WorkflowExecutionsPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const { currentBusiness } = useBusiness();
  const [workflowName, setWorkflowName] = useState('');
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) loadAll();
  }, [currentBusiness, workflowId]);

  const loadAll = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data: wf } = await supabase.from('workflows').select('name').eq('id', workflowId).eq('business_id', currentBusiness.id).maybeSingle();
    setWorkflowName(wf?.name || 'Workflow');
    const { data } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('business_id', currentBusiness.id)
      .order('started_at', { ascending: false });
    setExecutions((data || []) as Execution[]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/automation/workflows/${workflowId}`}>
          <Button variant="ghost" size="icon" aria-label="Back to workflow"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executions</h1>
          <p className="text-muted-foreground">Run history for “{workflowName}”</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : executions.length === 0 ? (
            <EmptyState icon={Activity} title="No executions yet" description="Runs appear here when this workflow triggers." />
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {executions.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell><Badge variant={e.status === 'completed' ? 'default' : e.status === 'failed' ? 'destructive' : 'secondary'}>{e.status}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(e.started_at).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{e.completed_at ? new Date(e.completed_at).toLocaleString() : '—'}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{JSON.stringify(e.trigger_data || {}).slice(0, 60)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/automation/workflows/${workflowId}/executions/${e.id}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}