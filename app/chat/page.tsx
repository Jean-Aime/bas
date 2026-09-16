'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Zap, Store, Loader2, ArrowRight } from 'lucide-react';
import { slugify } from '@/lib/slug';

interface Business {
  id: string;
  name: string;
  type: string;
  description: string | null;
  currency: string;
}

export default function ChatPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, type, description, currency')
      .eq('status', 'active')
      .order('name');
    setBusinesses((data || []) as Business[]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-2">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">BAS Chat</p>
              <p className="text-xs text-muted-foreground">Select a business</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Choose a business to chat with</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start a conversation with any business powered by BAS</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {businesses.map((biz) => (
            <Link key={biz.id} href={`/chat/${slugify(biz.name)}`}>
              <Card className="cursor-pointer p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{biz.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{biz.type.replace(/_/g, ' ')}</p>
                    {biz.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{biz.description}</p>}
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {businesses.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No businesses available yet. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}