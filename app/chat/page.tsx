'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Zap, Store, Loader2, ArrowRight, Bot } from 'lucide-react';
import { slugify } from '@/lib/slug';
import { cn } from '@/lib/utils';

interface Business {
  id: string;
  name: string;
  type: string;
  description: string | null;
  currency: string;
}

const TYPE_COLORS: Record<string, string> = {
  clothing_store: 'bg-warning/100/10 text-warning',
  salon: 'bg-pink-500/10 text-pink-600',
  hotel: 'bg-blue-500/10 text-blue-600',
  restaurant: 'bg-warning/10 text-warning',
  ngo: 'bg-success/10 text-success',
  professional: 'bg-primary/10 text-primary',
  general: 'bg-primary/10 text-primary',
};

export default function ChatPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('businesses')
      .select('id, name, type, description, currency')
      .eq('status', 'active')
      .order('name')
      .then(({ data }) => {
        setBusinesses((data || []) as Business[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-fill shadow-lg">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading businesses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-border/60">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-fill shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">BAS Customer Chat</p>
            <p className="text-xs text-muted-foreground">AI-powered business assistant</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-10">
        {/* Hero */}
        <div className="mb-10 text-center animate-in-up">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl brand-fill shadow-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-heading text-foreground mb-2">Choose a business to chat with</h1>
          <p className="text-sm text-muted-foreground">
            Start a conversation with any business powered by BAS AI
          </p>
        </div>

        {/* Business list */}
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No businesses available yet</p>
            <p className="text-sm text-muted-foreground">Please check back later.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 animate-in-up delay-100">
            {businesses.map((biz, i) => (
              <Link key={biz.id} href={`/chat/${slugify(biz.name)}`} className="group block">
                <div
                  className="surface-raised rounded-2xl p-5 card-hover"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          'inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          TYPE_COLORS[biz.type] ?? TYPE_COLORS.general
                        )}>
                          {biz.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground mb-1">{biz.name}</p>
                      {biz.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{biz.description}</p>
                      )}
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                    <span className="text-[11px] text-muted-foreground font-medium">AI Assistant online</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
