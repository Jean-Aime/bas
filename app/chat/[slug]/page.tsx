'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ChatWidget, type ChatBusiness } from '@/components/chat/chat-widget';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import { slugify } from '@/lib/slug';
import { EmptyState } from '@/components/ui/page-states';

export default function BusinessChatPage() {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<ChatBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('businesses')
      .select('id, name, type, description, currency')
      .eq('status', 'active')
      .order('name')
      .then(({ data }) => {
        const match = (data || []).find((b: ChatBusiness) => slugify(b.name) === slug);
        setBusiness(match || null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-fill shadow-lg">
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col ">
      <header className="sticky top-0 z-10 glass border-b border-border/60 shrink-0">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/chat"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-fill shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {business ? business.name : 'Business not found'}
            </p>
            <p className="text-xs text-muted-foreground">
              {business ? `${business.type.replace(/_/g, ' ')} · AI Assistant` : ''}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-2xl flex flex-col px-0 sm:px-4 sm:py-4">
        {business ? (
          <div className="flex-1 sm:surface-raised sm:rounded-2xl overflow-hidden">
            <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-96px)]">
              <ChatWidget business={business} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-5">
            <EmptyState
              title="Business not found"
              description={`No active business matches "${slug}". It may have changed its name or is not yet powered by BAS.`}
              actionHref="/chat"
              actionLabel="Browse businesses"
            />
          </div>
        )}
      </div>
    </div>
  );
}
