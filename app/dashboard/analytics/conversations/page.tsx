'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { BreakdownCard } from '@/components/dashboard/breakdown-card';

export default function ConversationAnalyticsPage() {
  const { currentBusiness } = useBusiness();
  const [byStatus, setByStatus] = useState<{ label: string; count: number }[]>([]);
  const [byChannel, setByChannel] = useState<{ label: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) load();
  }, [currentBusiness]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase.from('conversations').select('status, channel').eq('business_id', currentBusiness.id);
    const rows = (data || []) as { status: string; channel: string }[];
    const group = (key: 'status' | 'channel') =>
      Object.entries(rows.reduce<Record<string, number>>((acc, r) => {
        acc[r[key]] = (acc[r[key]] || 0) + 1;
        return acc;
      }, {})).map(([label, count]) => ({ label, count }));
    setByStatus(group('status'));
    setByChannel(group('channel'));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversation analytics</h1>
        <p className="text-muted-foreground">How conversations break down across status and channel.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BreakdownCard title="By status" rows={byStatus} loading={loading} />
        <BreakdownCard title="By channel" rows={byChannel} loading={loading} />
      </div>
    </div>
  );
}