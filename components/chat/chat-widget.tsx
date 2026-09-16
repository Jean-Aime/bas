'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'customer' | 'assistant';
  content: string;
  intent?: string;
  confidence?: number;
}

export interface ChatBusiness {
  id: string;
  name: string;
  type: string;
  description: string | null;
  currency: string;
}

/**
 * Customer-facing AI conversation widget. Used by both the business picker
 * (/chat) and direct slug routes (/chat/[slug]). Talks to /api/chat.
 */
export function ChatWidget({ business }: { business: ChatBusiness }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hello! I'm the ${business.name} assistant. How can I help you today?` },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [handover, setHandover] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'customer', content: msg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
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

  return (
    <Card className="flex h-[calc(100vh-140px)] flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 ${
              msg.role === 'customer' ? 'bg-primary text-primary-foreground rounded-br-sm' :
              'bg-muted text-foreground rounded-bl-sm'
            }`}>
              {msg.role === 'assistant' && (
                <div className="mb-1 flex items-center gap-1.5">
                  <Bot className="h-3 w-3 text-primary" />
                  {msg.intent && <span className="text-xs text-muted-foreground">{msg.intent}</span>}
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-muted p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t p-3">
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
      {handover && (
        <div className="flex items-center gap-1.5 border-t bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
          <User className="h-3 w-3" /> Connected to staff — a team member has taken over this conversation.
        </div>
      )}
    </Card>
  );
}