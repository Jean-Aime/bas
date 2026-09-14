'use client';

import Link from 'next/link';
import { EmptyState } from '@/components/ui/page-states';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function KnowledgeSourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge sources</h1>
        <p className="text-muted-foreground">Website imports, documents, and manual entries feeding the assistant.</p>
      </div>
      <EmptyState
        icon={BookOpen}
        title="Source management lives in Knowledge"
        description="Import website URLs and manage knowledge sources from the Knowledge center."
        actionHref="/dashboard/knowledge"
        actionLabel="Go to Knowledge"
      />
      <Link href="/dashboard/knowledge"><Button variant="ghost">← Back to Knowledge</Button></Link>
    </div>
  );
}