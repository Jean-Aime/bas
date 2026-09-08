'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Workflow, Plus, Zap, Activity, Loader2, Play, CheckCircle2, XCircle, Pencil } from 'lucide-react';
import Link from 'next/link';
import { getTemplates, type WorkflowTemplate } from '@/lib/workflow/templates';
import { toast } from 'sonner';

interface WorkflowRow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  status: string;
  version: number;
  is_template: boolean;
  template_id: string | null;
}

interface ExecutionRow {
  id: string;
  workflow_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  result: Record<string, unknown>;
}

export default function AutomationPage() {
  const { currentBusiness } = useBusiness();
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [executions, setExecutions] = useState<ExecutionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (currentBusiness) loadAll(); }, [currentBusiness]);

  const loadAll = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const bid = currentBusiness.id;
    const [wfs, execs] = await Promise.all([
      supabase.from('workflows').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
      supabase.from('workflow_executions').select('*').eq('business_id', bid).order('started_at', { ascending: false }).limit(10),
    ]);
    setWorkflows((wfs.data || []) as WorkflowRow[]);
    setExecutions((execs.data || []) as ExecutionRow[]);
    setLoading(false);
  };

  const createFromTemplate = async (tpl: WorkflowTemplate) => {
    if (!currentBusiness) return;
    setCreating(true);
    const { error } = await supabase.from('workflows').insert({
      business_id: currentBusiness.id,
      name: tpl.name,
      description: tpl.description,
      trigger_type: tpl.trigger_type,
      trigger_condition: { intent: tpl.trigger_intent },
      steps: tpl.steps,
      status: 'active',
      version: 1,
      is_template: false,
      template_id: tpl.id,
    });
    if (error) { toast.error(error.message); setCreating(false); return; }
    toast.success(`Workflow "${tpl.name}" created`);
    setCreating(false);
    setTemplateDialog(false);
    loadAll();
  };

  const toggleStatus = async (wf: WorkflowRow) => {
    const newStatus = wf.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('workflows').update({ status: newStatus }).eq('id', wf.id);
    if (error) { toast.error(error.message); return; }
    loadAll();
  };

  const templates = getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automation</h1>
          <p className="text-muted-foreground">Manage workflows and automation rules</p>
        </div>
        <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Workflow</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Workflow from Template</DialogTitle></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((tpl) => (
                <Card key={tpl.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => createFromTemplate(tpl)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{tpl.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                        <Badge variant="outline" className="mt-2">{tpl.steps.length} steps</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {creating && <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Workflow className="h-5 w-5" /> Active Workflows</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : workflows.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Workflow className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No workflows yet. Create one from a template.</p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Trigger</TableHead><TableHead>Steps</TableHead><TableHead>Status</TableHead><TableHead>Version</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {workflows.map((w) => {
                  const tpl = templates.find((t) => t.id === w.template_id);
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell><Badge variant="outline">{w.trigger_type}</Badge></TableCell>
                      <TableCell>{tpl?.steps.length || '—'}</TableCell>
                      <TableCell><Badge variant={w.status === 'active' ? 'default' : 'secondary'}>{w.status}</Badge></TableCell>
                      <TableCell>v{w.version}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/dashboard/automation/${w.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="mr-1 h-3 w-3" /> Edit
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => toggleStatus(w)}>
                            {w.status === 'active' ? 'Pause' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Executions</CardTitle></CardHeader>
        <CardContent className="p-0">
          {executions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No workflow executions yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Workflow</TableHead><TableHead>Status</TableHead><TableHead>Started</TableHead><TableHead>Result</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {executions.map((e) => {
                  const wf = workflows.find((w) => w.id === e.workflow_id);
                  const resultData = e.result as Record<string, unknown>;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{wf?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {e.status === 'completed' ? <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /> Completed</span> :
                         e.status === 'failed' ? <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /> Failed</span> :
                         <Badge variant="outline">{e.status}</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(e.started_at).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{String(resultData?.response || '—')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
