'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, ChevronUp, ChevronDown, Play,
  Workflow as WorkflowIcon, CheckCircle2, XCircle, Zap, MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { WorkflowStep, IntentType } from '@/lib/types';

const STEP_TYPES = [
  { value: 'intent_detection', label: 'Detect Intent' },
  { value: 'entity_extraction', label: 'Extract Entities' },
  { value: 'knowledge_search', label: 'Search Knowledge Base' },
  { value: 'product_search', label: 'Search Products' },
  { value: 'service_search', label: 'Search Services' },
  { value: 'check_availability', label: 'Check Availability' },
  { value: 'check_staff', label: 'Check Staff' },
  { value: 'collect_info', label: 'Collect Customer Info' },
  { value: 'create_customer', label: 'Create Customer Record' },
  { value: 'create_order', label: 'Create Order Record' },
  { value: 'create_booking', label: 'Create Booking Record' },
  { value: 'response_generation', label: 'Generate Response' },
  { value: 'notify_business', label: 'Notify Business' },
  { value: 'send_message', label: 'Send Reply' },
  { value: 'handover', label: 'Human Handover' },
];

const INTENTS: IntentType[] = [
  'PRODUCT_INQUIRY', 'SERVICE_INQUIRY', 'PRICE_INQUIRY', 'ORDER', 'BOOKING',
  'APPOINTMENT', 'AVAILABILITY', 'DELIVERY', 'PAYMENT', 'CANCELLATION', 'RETURN',
  'COMPLAINT', 'FAQ', 'HUMAN_SUPPORT', 'GENERAL_INQUIRY',
];

const TRIGGER_TYPES = ['message', 'schedule', 'webhook'];

interface WorkflowRow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_condition: Record<string, unknown>;
  steps: WorkflowStep[];
  status: string;
  version: number;
}

interface TestResult {
  matched: boolean;
  steps: Array<{ name: string; status: string; message: string }>;
  reply: string | null;
  intent: string;
  confidence: number;
  shouldEscalate?: boolean;
}

export default function WorkflowBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [workflow, setWorkflow] = useState<WorkflowRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('message');
  const [triggerIntent, setTriggerIntent] = useState<string>('GENERAL_INQUIRY');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (id && currentBusiness) loadWorkflow();
  }, [id, currentBusiness]);

  const loadWorkflow = async () => {
    if (!id || !currentBusiness) return;
    setLoading(true);
    const { data } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .eq('business_id', currentBusiness.id)
      .maybeSingle();

    if (!data) {
      toast.error('Workflow not found');
      router.push('/dashboard/automation');
      return;
    }

    const wf = data as unknown as WorkflowRow;
    setWorkflow(wf);
    setName(wf.name);
    setDescription(wf.description || '');
    setTriggerType(wf.trigger_type);
    setTriggerIntent(String((wf.trigger_condition as Record<string, string>)?.intent || 'GENERAL_INQUIRY'));
    setSteps(wf.steps || []);
    setStatus(wf.status);
    setLoading(false);
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { name: 'New Step', type: 'response_generation', config: {} }]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateStepType = (index: number, type: string) => {
    setSteps((prev) => prev.map((s, i) => {
      if (i !== index) return s;
      const tpl = STEP_TYPES.find((t) => t.value === type);
      return { ...s, type, name: tpl?.label || s.name };
    }));
  };

  const updateStepName = (index: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, name: value } : s)));
  };

  const handleSave = async () => {
    if (!currentBusiness || !workflow || !name.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('workflows')
      .update({
        name: name.trim(),
        description: description || null,
        trigger_type: triggerType,
        trigger_condition: { intent: triggerIntent },
        steps,
        status,
        version: workflow.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflow.id);
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success(`Workflow saved (v${workflow.version + 1})`);
    loadWorkflow();
    setSaving(false);
  };

  const handleTest = async () => {
    if (!workflow || !currentBusiness || !testMessage.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/workflows/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow.id,
          businessId: currentBusiness.id,
          message: testMessage.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Test failed');
      setTestResult(data as TestResult);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/automation">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Workflow Builder</h1>
          <p className="text-muted-foreground text-sm">Configure triggers, conditions, and actions</p>
        </div>
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
        <Badge variant="outline">v{workflow?.version}</Badge>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save (bump to v{(workflow?.version || 0) + 1})
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><WorkflowIcon className="h-4 w-4" /> Workflow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer Booking" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What does this workflow do?" />
              </div>
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger><SelectValue placeholder="Select trigger" /></SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trigger Intent</Label>
                <Select value={triggerIntent} onValueChange={setTriggerIntent}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any intent</SelectItem>
                    {INTENTS.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">The workflow runs when a customer message is classified with this intent.</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Pause to stop matching new messages</p>
                </div>
                <Switch checked={status === 'active'} onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Steps editor */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Workflow Steps</CardTitle>
                <CardDescription>Steps run in order for each matched message</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addStep}>
                <Plus className="mr-2 h-4 w-4" /> Add Step
              </Button>
            </CardHeader>
            <CardContent>
              {steps.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <WorkflowIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No steps yet. Add your first step to build the workflow.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={step.name}
                            onChange={(e) => updateStepName(index, e.target.value)}
                            placeholder="Step name"
                            className="flex-1"
                          />
                          <Select value={step.type} onValueChange={(v) => updateStepType(index, v)}>
                            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STEP_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => moveStep(index, -1)}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === steps.length - 1} onClick={() => moveStep(index, 1)}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeStep(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test execution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Play className="h-4 w-4" /> Test Execution</CardTitle>
              <CardDescription>Run this workflow against a sample customer message (no conversation is created)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder='e.g. "How much is braiding?"'
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTest(); }}
                />
                <Button onClick={handleTest} disabled={testing || !testMessage.trim()}>
                  {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                  Test
                </Button>
              </div>

              {testResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {testResult.matched ? (
                      <Badge><CheckCircle2 className="mr-1 h-3 w-3" /> Trigger matched</Badge>
                    ) : (
                      <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Trigger did not match</Badge>
                    )}
                    <Badge variant="outline">{testResult.intent} · {(testResult.confidence * 100).toFixed(0)}%</Badge>
                  </div>

                  <div className="space-y-2">
                    {testResult.steps.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                          s.status === 'completed' ? 'bg-green-100 text-green-700' :
                          s.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{i + 1}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {testResult.reply && (
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="mb-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Assistant reply
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{testResult.reply}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}