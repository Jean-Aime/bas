'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ChatWidget, type ChatBusiness } from '@/components/chat/chat-widget';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import { slugify } from '@/lib/slug';
import { EmptyState } from '@/components/ui/page-states';

export default function BusinessChatPage() {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<ChatBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, [slug]);

  const loadBusiness = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('businesses')
      .select('id, name, type, description, currency')
      .eq('status', 'active')
      .order('name');
    const match = (data || []).find((b: ChatBusiness) => slugify(b.name) === slug);
    setBusiness(match || null);
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
            <Link href="/chat">
              <Button variant="ghost" size="icon" aria-label="Back to business list">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            {business ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted" />
            )}
            <div>
              <p className="text-sm font-semibold">{business ? business.name : 'Not found'}</p>
              <p className="text-xs text-muted-foreground">
                {business ? `${business.type.replace(/_/g, ' ')} · AI Assistant` : 'Unknown business'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {business ? (
          <ChatWidget business={business} />
        ) : (
          <EmptyState
            title="Business not found"
            description={`No active business matches "${slug}". It may have changed its name or is not yet powered by BAS.`}
            actionHref="/chat"
            actionLabel="Browse businesses"
          />
        )}
      </div>
    </div>
  );
}