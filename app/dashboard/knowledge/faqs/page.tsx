'use client';

import Link from 'next/link';
import { EmptyState } from '@/components/ui/page-states';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export default function KnowledgeFaqsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">FAQs</h1>
        <p className="text-muted-foreground">Frequently asked questions your assistant answers from.</p>
      </div>
      <EmptyState
        icon={HelpCircle}
        title="FAQ management lives in Knowledge"
        description="Add, edit, and publish FAQs from the Knowledge center — the AI answers customers with them."
        actionHref="/dashboard/knowledge"
        actionLabel="Go to Knowledge"
      />
      <Link href="/dashboard/knowledge"><Button variant="ghost">← Back to Knowledge</Button></Link>
    </div>
  );
}