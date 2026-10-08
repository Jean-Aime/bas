'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'customer' | 'assistant';
  content: string;
  intent?: string;
  confidence?: number;
  error?: boolean;
}

export interface ChatBusiness {
  id: string;
  name: string;
  type: string;
  description: string | null;
  currency: string;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-in-up-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg brand-fill mt-0.5 shadow-sm mr-2.5">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bubble-bot px-4 py-3 flex items-center gap-1.5">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function IntentChip({ intent, confidence }: { intent: string; confidence?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      {intent.toLowerCase().replace(/_/g, ' ')}
      {confidence !== undefined && <span className="opacity-60">{Math.round(confidence * 100)}%</span>}
    </span>
  );
}

export function ChatWidget({ business }: { business: ChatBusiness }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi there! 👋 I'm the ${business.name} assistant. I can help you with products, services, bookings, and more.\n\nWhat can I help you with today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [handover, setHandover] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'customer', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, message: msg, conversationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply,
        intent: data.intent,
        confidence: data.confidence,
      }]);

      if (data.shouldEscalate && !handover) {
        setHandover(true);
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: "I've connected you with a team member who will be with you shortly.",
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again.',
        error: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: `Hi there! 👋 I'm the ${business.name} assistant. What can I help you with today?`,
    }]);
    setConversationId(null);
    setHandover(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--surface-1))]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3.5 shrink-0">
        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-fill shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-background">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{business.name}</p>
          <p className="text-xs text-muted-foreground">
            {handover ? 'Connected to staff' : 'AI Assistant · Online'}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="New conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-2.5 animate-in-up-sm',
              msg.role === 'customer' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg brand-fill mt-0.5 shadow-sm">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
            )}

            <div className={cn('max-w-[78%] flex flex-col', msg.role === 'customer' ? 'items-end' : 'items-start', 'gap-1.5')}>
              {msg.intent && msg.role === 'assistant' && (
                <IntentChip intent={msg.intent} confidence={msg.confidence} />
              )}
              <div className={cn(
                'px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'customer' ? 'bubble-user' : 'bubble-bot',
                msg.error && 'opacity-70'
              )}>
                {msg.error && <AlertCircle className="inline h-3.5 w-3.5 mr-1.5 text-destructive" />}
                {msg.content}
              </div>
            </div>

            {msg.role === 'customer' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {loading && <TypingIndicator />}
      </div>

      {/* Handover banner */}
      {handover && (
        <div className="flex items-center gap-2 border-t border-warning/30 bg-warning/10 px-4 py-2.5 shrink-0">
          <User className="h-3.5 w-3.5 text-warning shrink-0" />
          <p className="text-xs font-medium text-warning">A team member has taken over this conversation.</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/60 bg-card px-3 py-3 shrink-0">
        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-[hsl(var(--surface-1))] px-3 py-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50 py-1"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
              input.trim() && !loading
                ? 'brand-fill text-white shadow-sm hover:opacity-90 active:scale-95'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50 flex items-center justify-center gap-1">
          <Zap className="h-2.5 w-2.5" />
          Powered by BAS
        </p>
      </div>
    </div>
  );
}
