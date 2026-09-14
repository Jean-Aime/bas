'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Loader2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/page-states';

interface ImportRow {
  id: string;
  title: string;
  url: string | null;
  status: string;
  created_at: string;
}

export default function WebsiteImportsPage() {
  const { currentBusiness } = useBusiness();
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) load();
  }, [currentBusiness]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase
      .from('knowledge_sources')
      .select('id, title, url, status, created_at')
      .eq('business_id', currentBusiness.id)
      .eq('source_type', 'website')
      .order('created_at', { ascending: false });
    setImports((data || []) as ImportRow[]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website imports</h1>
          <p className="text-muted-foreground">Every website URL you&apos;ve imported as business knowledge.</p>
        </div>
        <Link href="/dashboard/knowledge/sources/new">
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New import</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : imports.length === 0 ? (
            <EmptyState icon={Globe} title="No imports yet" description="Import your website URL to build business knowledge." actionHref="/dashboard/knowledge/sources/new" actionLabel="Start an import" />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>URL</TableHead><TableHead>Status</TableHead><TableHead>Imported</TableHead><TableHead className="text-right">Details</TableHead></TableRow></TableHeader>
              <TableBody>
                {imports.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">{i.url || '—'}</TableCell>
                    <TableCell><Badge variant={i.status === 'processed' ? 'default' : 'secondary'}>{i.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/website/imports/${i.id}`}><Button size="sm" variant="ghost">View</Button></Link>
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