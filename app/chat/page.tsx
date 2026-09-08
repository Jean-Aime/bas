'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Zap, Send, Bot, User, Loader2, ArrowLeft, Store } from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  role: 'customer' | 'assistant';
  content: string;
  intent?: string;
  confidence?: number;
}

interface Business {
  id: string;
  name: string;
  type: string;
  description: string | null;
  currency: string;
}

export default function ChatPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [handover, setHandover] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadBusinesses = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, type, description, currency')
      .eq('status', 'active')
      .order('name');
    setBusinesses((data || []) as Business[]);
    setLoadingBiz(false);
  };

  const selectBusiness = (biz: Business) => {
    setSelectedBiz(biz);
    setMessages([{ role: 'assistant', content: `Hello! I'm the ${biz.name} assistant. How can I help you today?` }]);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedBiz || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'customer', content: msg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBiz.id,
          message: msg,
          conversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to get response');

      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply,
        intent: data.intent,
        confidence: data.confidence,
      }]);

      if (data.shouldEscalate) {
        setHandover(true);
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: 'A team member will be with you shortly. Your conversation has been escalated to our staff.',
        }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I apologize, I encountered an issue. Please try again or contact us directly.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loadingBiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {selectedBiz ? (
              <Button variant="ghost" size="icon" onClick={() => { setSelectedBiz(null); setMessages([]); setConversationId(null); setHandover(false); }}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">{selectedBiz ? selectedBiz.name : 'BAS Chat'}</p>
              <p className="text-xs text-muted-foreground">{selectedBiz ? (handover ? 'Connected to staff' : 'AI Assistant') : 'Select a business'}</p>
            </div>
          </div>
          {selectedBiz && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              {handover ? <User className="h-3 w-3 text-orange-500" /> : <Bot className="h-3 w-3 text-primary" />}
              <span className="text-xs font-medium text-primary">{handover ? 'Human' : 'AI'}</span>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {!selectedBiz ? (
          /* Business selection */
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Choose a business to chat with</h1>
              <p className="mt-1 text-sm text-muted-foreground">Start a conversation with any business powered by BAS</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {businesses.map((biz) => (
                <Card key={biz.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => selectBusiness(biz)}>
                  <div className="p-4">
                    <p className="font-semibold">{biz.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{biz.type.replace(/_/g, ' ')}</p>
                    {biz.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{biz.description}</p>}
                  </div>
                </Card>
              ))}
            </div>
            {businesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No businesses available yet. Please check back later.</p>
              </div>
            )}
          </div>
        ) : (
          /* Chat interface */
          <Card className="flex h-[calc(100vh-140px)] flex-col overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.role === 'customer' ? 'bg-primary text-primary-foreground rounded-br-sm' :
                    'bg-slate-100 text-slate-900 rounded-bl-sm'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bot className="h-3 w-3 text-primary" />
                        {msg.intent && <span className="text-xs text-muted-foreground">{msg.intent}</span>}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 p-3 rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t p-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
