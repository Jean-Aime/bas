'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';

interface ImportDetail {
  id: string;
  title: string;
  url: string | null;
  content: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ImportDetailPage() {
  const { importId } = useParams<{ importId: string }>();
  const { currentBusiness } = useBusiness();
  const [source, setSource] = useState<ImportDetail | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) load();
  }, [currentBusiness, importId]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('id', importId)
      .eq('business_id', currentBusiness.id)
      .maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setSource(data as ImportDetail);
    const { count } = await supabase
      .from('knowledge_documents')
      .select('id', { count: 'exact', head: true })
      .eq('source_id', importId)
      .eq('business_id', currentBusiness.id);
    setDocumentCount(count || 0);
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading import…" />;
  if (error || !source) return <ErrorState message="This import does not exist in the current business." onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/website/imports">
          <Button variant="ghost" size="icon" aria-label="Back to imports"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{source.title}</h1>
          <p className="text-sm text-muted-foreground">{source.url || 'No URL'} · imported {new Date(source.created_at).toLocaleString()}</p>
        </div>
        <Badge className="ml-auto" variant={source.status === 'processed' ? 'default' : 'secondary'}>{source.status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Import details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Source type</span><Badge variant="outline">website</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Extracted documents</span><span className="font-medium">{documentCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last updated</span><span>{new Date(source.updated_at).toLocaleString()}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Extracted content</CardTitle></CardHeader>
          <CardContent>
            {source.content ? (
              <p className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{source.content.slice(0, 4000)}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No extracted content recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}