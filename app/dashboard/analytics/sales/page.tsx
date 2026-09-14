'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreakdownCard } from '@/components/dashboard/breakdown-card';
import { Loader2 } from 'lucide-react';

export default function SalesAnalyticsPage() {
  const { currentBusiness } = useBusiness();
  const [byStatus, setByStatus] = useState<{ label: string; count: number }[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) load();
  }, [currentBusiness]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase.from('orders').select('status, total_amount').eq('business_id', currentBusiness.id);
    const rows = (data || []) as { status: string; total_amount: number }[];
    setByStatus(Object.entries(rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {})).map(([label, count]) => ({ label, count })));
    setRevenue(rows.filter((r) => r.status === 'completed' || r.status === 'confirmed').reduce((s, r) => s + Number(r.total_amount), 0));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales analytics</h1>
        <p className="text-muted-foreground">Order volume and revenue across statuses.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Confirmed + completed revenue</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : (
            <p className="text-4xl font-bold">{currentBusiness?.currency} {revenue.toFixed(2)}</p>
          )}
        </CardContent>
      </Card>
      <BreakdownCard title="Orders by status" rows={byStatus} loading={loading} />
    </div>
  );
}