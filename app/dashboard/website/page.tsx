'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, ArrowRight, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/page-states';

interface KnowledgeSource {
  id: string;
  source_type: string;
  title: string;
  url: string | null;
  status: string;
  created_at: string;
}

export default function WebsitePage() {
  const { currentBusiness } = useBusiness();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) loadSources();
  }, [currentBusiness]);

  const loadSources = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase
      .from('knowledge_sources')
      .select('id, source_type, title, url, status, created_at')
      .eq('business_id', currentBusiness.id)
      .order('created_at', { ascending: false });
    setSources((data || []).filter((s) => s.source_type === 'website') as KnowledgeSource[]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website</h1>
          <p className="text-muted-foreground">Connect your website URL and import public content as business knowledge.</p>
        </div>
        <Link href="/dashboard/knowledge">
          <Button><Globe className="mr-2 h-4 w-4" /> Import website URL</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Connection</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current website</span>
              <span className="font-medium">{currentBusiness?.website_url || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Knowledge access</span>
              <Badge>Available</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Transactional access</span>
              <Badge variant="outline">Not connected</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Importing a website grants knowledge access only — never order, inventory, booking, or payment actions. Those require explicit connector authorization.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Imports</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : sources.length === 0 ? (
              <EmptyState icon={Globe} title="No website imports yet" description="Use the knowledge page to import your website URL." actionHref="/dashboard/knowledge" actionLabel="Go to Knowledge" />
            ) : (
              <div className="space-y-2">
                {sources.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.url}</p>
                    </div>
                    <Badge variant={s.status === 'processed' ? 'default' : 'secondary'}>{s.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Link href="/dashboard/knowledge" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        Manage all knowledge sources <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}