'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { BreakdownCard } from '@/components/dashboard/breakdown-card';

export default function AutomationAnalyticsPage() {
  const { currentBusiness } = useBusiness();
  const [byStatus, setByStatus] = useState<{ label: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) load();
  }, [currentBusiness]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase.from('workflow_executions').select('status').eq('business_id', currentBusiness.id);
    const rows = (data || []) as { status: string }[];
    setByStatus(Object.entries(rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {})).map(([label, count]) => ({ label, count })));
    setLoading(false);
  };

  const completed = byStatus.find((r) => r.label === 'completed')?.count || 0;
  const total = byStatus.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automation analytics</h1>
        <p className="text-muted-foreground">Workflow execution outcomes across your business.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BreakdownCard title="Executions by status" rows={byStatus} loading={loading} />
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Success rate</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">{total > 0 ? Math.round((completed / total) * 100) : 0}%</p>
          <p className="mt-1 text-sm text-muted-foreground">{completed} of {total} executions completed</p>
        </div>
      </div>
    </div>
  );
}