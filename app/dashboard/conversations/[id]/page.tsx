'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Bot, User, Zap, Activity, Loader2, Sparkles, Headset, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useBusiness } from '@/lib/auth/business-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Conversation, Message, WorkflowExecutionLog } from '@/lib/types';

type BubbleMeta = {
  align: 'left' | 'right';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  bubble: string;
  chip: string;
};

const SENDER_STYLES: Record<string, BubbleMeta> = {
  customer: {
    align: 'left',
    icon: UserCircle2,
    label: 'Customer',
    bubble: 'bg-muted text-foreground',
    chip: 'bg-muted text-muted-foreground',
  },
  assistant: {
    align: 'right',
    icon: Bot,
    label: 'AI Assistant',
    bubble: 'bg-primary text-primary-foreground',
    chip: 'bg-primary/15 text-primary-foreground/90',
  },
  staff: {
    align: 'right',
    icon: Headset,
    label: 'Agent',
    bubble: 'bg-success text-success-foreground',
    chip: 'bg-success/20 text-success-foreground',
  },
  system: {
    align: 'left',
    icon: Zap,
    label: 'System',
    bubble: 'bg-surface-2 text-foreground/80 border border-border',
    chip: 'bg-border/60 text-muted-foreground',
  },
};

const LOG_STATUS_STYLES: Record<string, string> = {
  completed: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  running: 'bg-info/10 text-info animate-pulse',
};

export default function ConversationDetailPage() {
  const { id } = useParams();
  const { currentBusiness } = useBusiness();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && currentBusiness) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentBusiness]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadData = async () => {
    if (!id || !currentBusiness) return;
    setLoading(true);
    const [msgs, conv] = await Promise.all([
      supabase.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true }),
      supabase.from('conversations').select('*').eq('id', id).maybeSingle(),
    ]);
    setMessages((msgs.data || []) as Message[]);
    setConversation(conv.data as Conversation);

    const { data: execs } = await supabase
      .from('workflow_executions')
      .select('id')
      .eq('conversation_id', id)
      .order('started_at', { ascending: false })
      .limit(1);

    if (execs && execs.length > 0) {
      const { data: logData } = await supabase
        .from('workflow_execution_logs')
        .select('*')
        .eq('execution_id', execs[0].id)
        .order('step_index', { ascending: true });
      setLogs((logData || []) as WorkflowExecutionLog[]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!reply.trim() || !id || !currentBusiness) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      conversation_id: id,
      business_id: currentBusiness.id,
      sender_type: 'staff',
      content: reply,
    });
    if (error) { toast.error(error.message); setSending(false); return; }
    setReply('');
    setSending(false);
    loadData();
  };

  const handleTakeover = async () => {
    if (!id || !currentBusiness) return;
    const { error } = await supabase.from('conversations')
      .update({ is_handover: true, status: 'handover' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Conversation taken over');
    loadData();
  };

  const handleResolve = async () => {
    if (!id || !currentBusiness) return;
    const { error } = await supabase.from('conversations')
      .update({ status: 'resolved' }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Conversation resolved');
    loadData();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn('mb-4 flex', i % 2 ? 'justify-end' : 'justify-start')}>
                <Skeleton className={cn('h-16 rounded-2xl', i % 2 ? 'w-56' : 'w-48')} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex flex-1 items-center gap-3">
          <Link href="/dashboard/conversations">
            <Button variant="ghost" size="icon" aria-label="Back to conversations">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">Conversation</h1>
              <StatusBadge status={conversation?.is_handover ? 'handover' : conversation?.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="capitalize">{conversation?.channel || '—'}</Badge>
              {conversation?.detected_intent && <Badge variant="secondary">{conversation.detected_intent}</Badge>}
              {conversation?.confidence && (
                <span className="text-xs text-muted-foreground">
                  {(conversation.confidence * 100).toFixed(0)}% confidence
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!conversation?.is_handover && (
            <Button variant="outline" size="sm" onClick={handleTakeover}>Take Over</Button>
          )}
          {conversation?.status !== 'resolved' && (
            <Button variant="outline" size="sm" onClick={handleResolve}>Mark Resolved</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chat */}
        <div className="flex h-[620px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium">Messages</span>
            <span className="text-xs text-muted-foreground">{messages.length} messages</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No messages in this conversation.</p>
            ) : (
              messages.map((m) => {
                const s = SENDER_STYLES[m.sender_type] ?? SENDER_STYLES.system;
                const Icon = s.icon;
                const isEvent = m.sender_type === 'system';
                return (
                  <div
                    key={m.id}
                    className={cn('flex animate-fade-in', s.align === 'right' ? 'justify-end' : 'justify-start')}
                  >
                    {isEvent ? (
                      <div className="mx-auto flex items-center gap-1.5 rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3 text-primary" />
                        <span className="truncate max-w-xs">{m.content}</span>
                      </div>
                    ) : (
                      <div className={cn('max-w-[80%] sm:max-w-[70%]', s.align === 'right' && 'items-end')}>
                        <div
                          className={cn(
                            'mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground',
                            s.align === 'right' && 'justify-end'
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {s.label}
                          {m.intent && <span className="font-normal opacity-70">· {m.intent}</span>}
                        </div>
                        <div className={cn('rounded-2xl px-3.5 py-2.5 text-sm shadow-sm', s.bubble)}>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-end gap-2 border-t border-border p-3">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply as agent…"
              rows={2}
              className="flex-1 resize-none"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <Button onClick={handleSend} disabled={sending || !reply.trim()} size="icon" className="self-end" aria-label="Send reply">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Workflow execution */}
        <div className="flex h-[620px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Automation</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {logs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                </span>
                <p className="mt-3 text-sm font-medium">No automation ran</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Workflow executions for this conversation will appear here.
                </p>
              </div>
            ) : (
              <ol className="relative space-y-4 pl-1">
                <span className="absolute bottom-2 left-[13px] top-2 w-px bg-border" aria-hidden />
                {logs.map((log) => {
                  const tone = LOG_STATUS_STYLES[log.status] ?? 'bg-muted text-muted-foreground';
                  const done = log.status === 'completed';
                  return (
                    <li key={log.id} className="relative flex items-start gap-3">
                      <span
                        className={cn(
                          'z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                          tone
                        )}
                      >
                        {done ? <Sparkles className="h-3 w-3" /> : log.step_index + 1}
                      </span>
                      <div className="min-w-0 flex-1 pb-1">
                        <p className="text-sm font-medium leading-snug">{log.step_name}</p>
                        {log.message && (
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{log.message}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
