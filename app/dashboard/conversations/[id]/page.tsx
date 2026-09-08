'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Bot, User, Zap, Activity, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useBusiness } from '@/lib/auth/business-context';
import { toast } from 'sonner';
import type { Conversation, Message, WorkflowExecutionLog } from '@/lib/types';

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

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/conversations"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Conversation</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{conversation?.channel}</Badge>
            {conversation?.is_handover && <Badge variant="secondary">Handover</Badge>}
            {conversation?.detected_intent && <Badge>{conversation.detected_intent}</Badge>}
            {conversation?.confidence && <span className="text-xs text-muted-foreground">{(conversation.confidence * 100).toFixed(0)}% confidence</span>}
          </div>
        </div>
        {!conversation?.is_handover && <Button variant="outline" onClick={handleTakeover}>Take Over</Button>}
        {conversation?.status !== 'resolved' && <Button variant="outline" onClick={handleResolve}>Mark Resolved</Button>}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare /> Messages
            </CardTitle>
          </CardHeader>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No messages in this conversation.</p>
            ) : messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_type === 'customer' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  m.sender_type === 'customer' ? 'bg-slate-100 text-slate-900' :
                  m.sender_type === 'assistant' ? 'bg-primary text-primary-foreground' :
                  'bg-green-600 text-white'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {m.sender_type === 'customer' ? <User className="h-3 w-3" /> : m.sender_type === 'assistant' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    <span className="text-xs opacity-80">{m.sender_type}</span>
                    {m.intent && <span className="text-xs opacity-60">· {m.intent}</span>}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 flex gap-2">
            <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply..." rows={2} className="flex-1 resize-none" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
            <Button onClick={handleSend} disabled={sending || !reply.trim()} size="icon" className="self-end"><Send className="h-4 w-4" /></Button>
          </div>
        </Card>

        {/* Execution logs */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Activity className="h-4 w-4" /> Workflow Execution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Zap className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No workflow execution logs for this conversation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      log.status === 'completed' ? 'bg-green-100 text-green-700' :
                      log.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{log.step_index + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.step_name}</p>
                      {log.message && <p className="text-xs text-muted-foreground">{log.message}</p>}
                      <Badge variant={log.status === 'completed' ? 'default' : log.status === 'failed' ? 'destructive' : 'outline'} className="mt-1 text-xs">{log.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
