import { supabase } from '@/lib/supabase/client';
import type { Workflow, WorkflowExecution, WorkflowExecutionLog } from '@/lib/types';

/**
 * Execution service (client-side). Owns workflow-execution reads so pages
 * and the visualizer never query Supabase directly.
 */

export interface ExecutionDetail {
  execution: WorkflowExecution;
  logs: WorkflowExecutionLog[];
}

export async function fetchExecutionDetail(
  businessId: string,
  workflowId: string,
  executionId: string
): Promise<ExecutionDetail | null> {
  const { data: execution } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('id', executionId)
    .eq('workflow_id', workflowId)
    .eq('business_id', businessId)
    .maybeSingle();

  if (!execution) return null;

  const { data: logs } = await supabase
    .from('workflow_execution_logs')
    .select('*')
    .eq('execution_id', executionId)
    .eq('business_id', businessId)
    .order('step_index');

  return {
    execution: execution as WorkflowExecution,
    logs: (logs || []) as WorkflowExecutionLog[],
  };
}

export async function fetchWorkflowForBusiness(businessId: string, workflowId: string): Promise<Workflow | null> {
  const { data } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .eq('business_id', businessId)
    .maybeSingle();
  return (data as Workflow) || null;
}
