'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';

interface DocumentDetail {
  id: string;
  title: string;
  content: string;
  doc_type: string;
  created_at: string;
}

export default function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { currentBusiness } = useBusiness();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) load();
  }, [currentBusiness, documentId]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('id', documentId)
      .eq('business_id', currentBusiness.id)
      .maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setDoc(data as DocumentDetail);
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading document…" />;
  if (error || !doc) return <ErrorState message="This document does not exist in the current business." onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/knowledge/documents">
          <Button variant="ghost" size="icon" aria-label="Back to documents"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{doc.title}</h1>
          <p className="text-sm text-muted-foreground">Created {new Date(doc.created_at).toLocaleString()}</p>
        </div>
        <Badge className="ml-auto" variant="outline">{doc.doc_type}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Content</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap rounded-lg bg-surface-2 p-4 text-sm">{doc.content}</p>
        </CardContent>
      </Card>
    </div>
  );
}