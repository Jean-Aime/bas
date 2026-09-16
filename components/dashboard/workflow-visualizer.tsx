'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Workflow, WorkflowExecution } from '@/lib/types';
import {
  MessageSquare, Bot, Search, Package, Wrench, CalendarCheck, UserPlus,
  FileText, Send, Bell, Database, ArrowDown, Check, X, Loader2,
  type LucideIcon,
} from 'lucide-react';

/**
 * Workflow visualizer — renders the workflow's step pipeline as an animated
 * node graph: Trigger → steps → Result. When an execution is selected, the
 * execution path lights up node by node. GPU-friendly (transform/opacity).
 */

/* ---------------------------------------------------------------------- */
/* Step type → icon + category                                             */
/* ---------------------------------------------------------------------- */

type StepCategory = 'trigger' | 'decision' | 'action' | 'output';

interface StepVisual {
  icon: LucideIcon;
  category: StepCategory;
  description: string;
}

const STEP_VISUALS: Record<string, StepVisual> = {
  intent_detection: { icon: Bot, category: 'decision', description: 'Classify what the customer wants' },
  entity_extraction: { icon: Search, category: 'decision', description: 'Pull structured details from the message' },
  knowledge_search: { icon: Database, category: 'action', description: 'Search FAQs and policies' },
  product_search: { icon: Package, category: 'action', description: 'Match products in your catalog' },
  service_search: { icon: Wrench, category: 'action', description: 'Match services you offer' },
  check_availability: { icon: CalendarCheck, category: 'decision', description: 'Verify openings or stock' },
  check_staff: { icon: UserPlus, category: 'decision', description: 'See who is available to help' },
  collect_info: { icon: MessageSquare, category: 'action', description: 'Ask the customer for details' },
  create_customer: { icon: UserPlus, category: 'action', description: 'Save the customer record' },
  create_order: { icon: Package, category: 'output', description: 'Create the order' },
  create_booking: { icon: CalendarCheck, category: 'output', description: 'Create the booking' },
  response_generation: { icon: FileText, category: 'action', description: 'Compose the reply' },
  notify_business: { icon: Bell, category: 'output', description: 'Alert your team' },
  send_message: { icon: Send, category: 'output', description: 'Reply to the customer' },
  handover: { icon: UserPlus, category: 'output', description: 'Escalate to a human agent' },
};

export const FALLBACK_STEP_VISUAL: StepVisual = {
  icon: FileText,
  category: 'action',
  description: 'Workflow step',
};

export function stepVisual(type: string): StepVisual {
  return STEP_VISUALS[type] ?? FALLBACK_STEP_VISUAL;
}

const CATEGORY_STYLES: Record<StepCategory, { ring: string; chip: string; label: string }> = {
  trigger: { ring: 'border-primary/40 bg-primary/5', chip: 'bg-primary/10 text-primary', label: 'Trigger' },
  decision: { ring: 'border-info/40 bg-info/5', chip: 'bg-info/10 text-info', label: 'Decision' },
  action: { ring: 'border-border bg-card', chip: 'bg-secondary text-secondary-foreground', label: 'Action' },
  output: { ring: 'border-success/40 bg-success/5', chip: 'bg-success-soft text-success-soft-fg', label: 'Result' },
};

/* ---------------------------------------------------------------------- */
/* Execution log matching                                                  */
/* ---------------------------------------------------------------------- */

export interface ExecutionLogLite {
  step_index: number;
  status: string;
}

export type NodeState = 'idle' | 'active' | 'completed' | 'failed';

/**
 * Progressive animation driver: given the selected execution's step logs,
 * reveal completed nodes one by one, then hold the final state.
 * Returns the state per pipeline index (trigger = -1 sentinel is handled
 * by the consumer).
 */
export function useExecutionPlayback(logs: ExecutionLogLite[], totalNodes: number, enabled: boolean) {
  const [revealed, setRevealed] = useState(enabled ? 0 : totalNodes);

  useEffect(() => {
    if (!enabled || logs.length === 0) {
      setRevealed(enabled ? 0 : totalNodes);
      return;
    }
    setRevealed(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= logs.length) clearInterval(timer);
    }, 450);
    return () => clearInterval(timer);
  }, [logs, enabled, totalNodes]);

  return revealed;
}

function stateForIndex(index: number, revealed: number, logStatus?: string): NodeState {
  if (logStatus === 'failed') return 'failed';
  if (index < revealed) return 'completed';
  if (index === revealed) return 'active';
  return 'idle';
}

/* ---------------------------------------------------------------------- */
/* Node                                                                    */
/* ---------------------------------------------------------------------- */

function FlowNode({
  icon: Icon,
  title,
  description,
  badge,
  category,
  state,
  isLast,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  badge?: string;
  category: StepCategory;
  state: NodeState;
  isLast?: boolean;
}) {
  const styles = CATEGORY_STYLES[category];

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative flex w-full max-w-xs items-center gap-3 rounded-xl border p-3.5 text-left shadow-card transition-all duration-300',
          styles.ring,
          state === 'active' && 'scale-[1.03] border-primary shadow-card-hover ring-2 ring-ring/30',
          state === 'completed' && 'border-success/40',
          state === 'failed' && 'border-destructive/50 bg-destructive-soft'
        )}
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300',
            styles.chip,
            state === 'completed' && 'bg-success-soft text-success-soft-fg',
            state === 'failed' && 'bg-destructive/15 text-destructive',
            state === 'active' && 'animate-pulse-soft'
          )}
        >
          {state === 'completed' ? (
            <Check className="h-5 w-5" />
          ) : state === 'failed' ? (
            <X className="h-5 w-5" />
          ) : state === 'active' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{title}</p>
            {badge && (
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', styles.chip)}>
                {badge}
              </span>
            )}
          </div>
          {description && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>

      {/* Connector */}
      {!isLast && (
        <div className="relative flex h-8 w-px items-center justify-center" aria-hidden>
          <div
            className={cn(
              'absolute inset-0 w-px bg-border transition-colors duration-300',
              state === 'completed' && 'bg-success/50'
            )}
          />
          {(state === 'active' || state === 'completed') && (
            <div className="animate-dash absolute h-4 w-px bg-primary" />
          )}
          <ArrowDown className={cn(
            'absolute -bottom-1 h-3 w-3 bg-background text-border transition-colors duration-300',
            state === 'completed' && 'text-success'
          )} />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Visualizer                                                              */
/* ---------------------------------------------------------------------- */

export function WorkflowVisualizer({
  workflow,
  executions = [],
  logs,
  className,
}: {
  workflow: Pick<Workflow, 'trigger_type' | 'trigger_condition' | 'steps'>;
  /** Executions for this workflow; the first one with logs drives playback. */
  executions?: WorkflowExecution[];
  /** Real step logs (execution detail view). Overrides simulation. */
  logs?: ExecutionLogLite[];
  className?: string;
}) {
  const steps = workflow.steps || [];
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  // Newest execution with activity, else none (structure-only view).
  const replayable = useMemo(
    () => executions.filter((e) => e.status === 'completed' || e.status === 'failed'),
    [executions]
  );

  useEffect(() => {
    setSelectedExecutionId(replayable[0]?.id ?? null);
  }, [replayable]);

  const selected = replayable.find((e) => e.id === selectedExecutionId) || null;
  const hasOwnLogs = !!logs && logs.length > 0;
  const playbackOn = !!selected || hasOwnLogs;

  // Playback source: real logs when provided (execution detail page);
  // otherwise simulate per-step completion from the workflow shape.
  const simulatedLogs = useMemo(
    () => steps.map((s, i) => ({ step_index: i, status: selected?.status === 'failed' && i === steps.length - 1 ? 'failed' : 'completed' })),
    [steps, selected]
  );
  const effectiveLogs = hasOwnLogs ? logs! : simulatedLogs;
  const revealed = useExecutionPlayback(effectiveLogs, steps.length + 1, playbackOn);

  const intent = String((workflow.trigger_condition as Record<string, unknown>)?.intent || 'any');

  return (
    <div className={cn('space-y-5', className)}>
      {/* Execution picker */}
      {replayable.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption font-medium text-muted-foreground">Replay:</span>
          {replayable.slice(0, 5).map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setSelectedExecutionId(e.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                e.id === selectedExecutionId
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-secondary'
              )}
            >
              {new Date(e.started_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              <span className={cn('ml-1.5 inline-block h-1.5 w-1.5 rounded-full', e.status === 'failed' ? 'bg-destructive' : 'bg-success')} />
            </button>
          ))}
        </div>
      )}

      {/* Pipeline */}
      <div className="flex flex-col items-center" role="list" aria-label="Workflow pipeline">
        {/* Trigger node */}
        <FlowNode
          icon={MessageSquare}
          title="Customer message"
          description={intent === 'any' ? 'Any detected intent triggers this workflow' : `Runs when intent is ${intent}`}
          badge="Trigger"
          category="trigger"
          state={playbackOn ? stateForIndex(-1, revealed, 'completed') : 'idle'}
          isLast={steps.length === 0}
        />

        {steps.map((step, i) => {
          const visual = stepVisual(step.type);
          const log = effectiveLogs[i];
          return (
            <FlowNode
              key={`${step.name}-${i}`}
              icon={visual.icon}
              title={step.name}
              description={visual.description}
              badge={CATEGORY_STYLES[visual.category].label}
              category={visual.category}
              state={playbackOn ? stateForIndex(i, revealed, log?.status) : 'idle'}
              isLast={i === steps.length - 1}
            />
          );
        })}

        {/* Result node */}
        {steps.length > 0 && (
          <FlowNode
            icon={Check}
            title={(hasOwnLogs ? selected?.status === 'failed' : selected?.status === 'failed') ? 'Execution failed' : 'Workflow complete'}
            description={selected?.status === 'failed' ? 'The last step failed — review the execution log' : 'Customer and business notified of the outcome'}
            badge="Result"
            category="output"
            state={playbackOn ? stateForIndex(steps.length, revealed) : 'idle'}
            isLast
          />
        )}
      </div>

      {!playbackOn && (
        <p className="text-center text-xs text-muted-foreground">
          Run or replay an execution to watch the pipeline light up.
        </p>
      )}
    </div>
  );
}
