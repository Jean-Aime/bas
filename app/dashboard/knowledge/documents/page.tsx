'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/page-states';

interface DocumentRow {
  id: string;
  title: string;
  doc_type: string;
  created_at: string;
}

export default function KnowledgeDocumentsPage() {
  const { currentBusiness } = useBusiness();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) load();
  }, [currentBusiness]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase
      .from('knowledge_documents')
      .select('id, title, doc_type, created_at')
      .eq('business_id', currentBusiness.id)
      .order('created_at', { ascending: false });
    setDocuments((data || []) as DocumentRow[]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge documents</h1>
        <p className="text-muted-foreground">Documents extracted from imports and manual entries.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : documents.length === 0 ? (
            <EmptyState icon={FileText} title="No documents yet" description="Import a website or add FAQs to build your knowledge base." actionHref="/dashboard/knowledge" actionLabel="Go to Knowledge" />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Details</TableHead></TableRow></TableHeader>
              <TableBody>
                {documents.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.title}</TableCell>
                    <TableCell><Badge variant="outline">{d.doc_type}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/knowledge/documents/${d.id}`}><Button size="sm" variant="ghost">View</Button></Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}