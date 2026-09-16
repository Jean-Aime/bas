import { supabase } from '@/lib/supabase/client';
import type { Conversation, Workflow, WorkflowExecution } from '@/lib/types';

/**
 * Dashboard service (client-side). Aggregated counts and recent rows for the
 * overview page — extracted so pages stay presentation-only.
 */

export interface DashboardStats {
  conversations: number;
  customers: number;
  orders: number;
  bookings: number;
  pendingRequests: number;
  activeWorkflows: number;
  aiHandled: number;
  handovers: number;
}

export interface RecentActivityRow {
  id: string;
  type: string;
  title: string;
  time: string;
  status: string;
}

export interface VolumePoint {
  day: string;
  messages: number;
}

export async function fetchDashboardStats(businessId: string): Promise<DashboardStats> {
  const [convs, custs, ords, bkgs, reqs, wfs, aiMsgs, handovers] = await Promise.all([
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('requests').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'pending'),
    supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'active'),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('sender_type', 'assistant'),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_handover', true),
  ]);

  return {
    conversations: convs.count || 0,
    customers: custs.count || 0,
    orders: ords.count || 0,
    bookings: bkgs.count || 0,
    pendingRequests: reqs.count || 0,
    activeWorkflows: wfs.count || 0,
    aiHandled: aiMsgs.count || 0,
    handovers: handovers.count || 0,
  };
}

export async function fetchRecentConversations(businessId: string, limit = 5): Promise<RecentActivityRow[]> {
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return ((data || []) as Conversation[]).map((c) => ({
    id: c.id,
    type: 'conversation',
    title: `${c.channel} conversation — ${c.detected_intent || 'general'}`,
    time: c.created_at,
    status: c.status,
  }));
}

/** 7-day message volume for the overview sparkline. */
export async function fetchWeeklyVolume(businessId: string): Promise<VolumePoint[]> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data } = await supabase
    .from('messages')
    .select('created_at')
    .eq('business_id', businessId)
    .gte('created_at', weekAgo);

  const dayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    dayMap.set(d.toLocaleDateString('en-US', { weekday: 'short' }), 0);
  }
  ((data || []) as Array<{ created_at: string }>).forEach((m) => {
    const label = new Date(m.created_at).toLocaleDateString('en-US', { weekday: 'short' });
    if (dayMap.has(label)) dayMap.set(label, (dayMap.get(label) || 0) + 1);
  });
  return Array.from(dayMap.entries()).map(([day, messages]) => ({ day, messages }));
}

/* ---------------------------------------------------------------------- */
/* Workflows + executions (visualizer data)                                */
/* ---------------------------------------------------------------------- */

export interface WorkflowWithExecutions {
  workflow: Workflow;
  executions: WorkflowExecution[];
}

export async function fetchWorkflow(businessId: string, workflowId: string): Promise<Workflow | null> {
  const { data } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .eq('business_id', businessId)
    .maybeSingle();
  return (data as Workflow) || null;
}

export async function fetchRecentExecutions(businessId: string, workflowId: string, limit = 10): Promise<WorkflowExecution[]> {
  const { data } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('business_id', businessId)
    .eq('workflow_id', workflowId)
    .order('started_at', { ascending: false })
    .limit(limit);
  return (data || []) as WorkflowExecution[];
}
