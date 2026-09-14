'use client';

import Link from 'next/link';
import { EmptyState } from '@/components/ui/page-states';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function KnowledgePoliciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Policies</h1>
        <p className="text-muted-foreground">Business policies — returns, cancellations, delivery, payments.</p>
      </div>
      <EmptyState
        icon={FileText}
        title="Policy management lives in Knowledge"
        description="Add and edit business policies from the Knowledge center."
        actionHref="/dashboard/knowledge"
        actionLabel="Go to Knowledge"
      />
      <Link href="/dashboard/knowledge"><Button variant="ghost">← Back to Knowledge</Button></Link>
    </div>
  );
}