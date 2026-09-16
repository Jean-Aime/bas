'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/ui/reveal';
import {
  MessageSquare, Bot, Database, CheckCircle2, RotateCcw, User,
} from 'lucide-react';

const STEPS = [
  { icon: Bot, label: 'Detect intent', detail: '“Product availability” — 98% confidence' },
  { icon: Database, label: 'Search product database', detail: 'Black sneakers · size 42' },
  { icon: CheckCircle2, label: 'Verify availability', detail: 'In stock — 3 pairs' },
] as const;

/**
 * Landing-page demo: a customer question flows through BAS's AI pipeline
 * and an accurate answer comes back. Auto-plays, respects reduced motion,
 * and offers a replay.
 */
export function AutomationDemo() {
  const [phase, setPhase] = useState(0); // 0 idle → 1 message → 2..4 steps → 5 answer
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduced) {
      setPhase(5);
      return;
    }
    if (phase >= 5) return;
    const delays = [1200, 900, 1100, 1000, 1100];
    const t = setTimeout(() => setPhase((p) => p + 1), delays[phase] ?? 1000);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  const done = phase >= 5;

  return (
    <Reveal>
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1fr_260px]">
        {/* Conversation card */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-card">
          <div className="flex items-center gap-2 border-b bg-secondary/50 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            <span className="ml-2 text-xs font-medium text-muted-foreground">Customer chat — bas.app/chat/demo-store</span>
          </div>
          <div className="space-y-3 p-4 sm:p-5">
            {/* Customer message */}
            <div className={cn('flex items-start gap-2.5 transition-all duration-300', phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-2.5 text-sm">
                Do you have black sneakers in size 42?
              </div>
            </div>

            {/* AI reply */}
            <div className={cn('flex items-start justify-end gap-2.5 transition-all duration-500', phase >= 5 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')}>
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground shadow-sm">
                Yes! The black sneakers are available in size 42 — 3 pairs in stock. Would you like me to create an order?
                <span className="mt-1.5 flex items-center gap-1 text-[11px] text-primary-foreground/70">
                  <Bot className="h-3 w-3" /> Answered by BAS AI
                </span>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-info">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {done && (
              <button
                type="button"
                onClick={() => setPhase(0)}
                className="mx-auto flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Replay
              </button>
            )}
          </div>
        </div>

        {/* Pipeline card */}
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-card">
          <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">Behind the scenes</p>
          {STEPS.map((step, i) => {
            const state = phase >= i + 2 ? 'done' : phase === i + 1 ? 'active' : 'idle';
            const StepIcon = step.icon;
            return (
              <div
                key={step.label}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg border p-2.5 transition-all duration-300',
                  state === 'done' && 'border-success/30 bg-success-soft/60',
                  state === 'active' && 'border-primary/40 bg-primary/5 shadow-focus-ring',
                  state === 'idle' && 'border-transparent opacity-50'
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                    state === 'done' ? 'bg-success-soft text-success-soft-fg' : state === 'active' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {state === 'done' ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className={cn('h-4 w-4', state === 'active' && 'animate-pulse-soft')} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{step.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{state === 'idle' ? '…' : step.detail}</p>
                </div>
              </div>
            );
          })}
          <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {done ? 'Customer notified — no human needed' : 'BAS is working…'}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
