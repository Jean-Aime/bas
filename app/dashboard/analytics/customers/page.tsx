'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CustomerAnalyticsPage() {
  const { currentBusiness } = useBusiness();
  const [total, setTotal] = useState(0);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [recent, setRecent] = useState<{ name: string | null; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBusiness) load();
  }, [currentBusiness]);

  const load = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('name, created_at')
      .eq('business_id', currentBusiness.id)
      .order('created_at', { ascending: false });
    const rows = (data || []) as { name: string | null; created_at: string }[];
    setTotal(rows.length);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    setNewThisMonth(rows.filter((r) => new Date(r.created_at) >= monthAgo).length);
    setRecent(rows.slice(0, 8));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer analytics</h1>
        <p className="text-muted-foreground">Customer growth and recent additions.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Total customers</CardTitle></CardHeader>
          <CardContent>{loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <p className="text-4xl font-bold">{total}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">New this month</CardTitle></CardHeader>
          <CardContent>{loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <p className="text-4xl font-bold">{newThisMonth}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent customers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers yet</p>
            ) : recent.map((r) => (
              <div key={r.created_at} className="flex items-center justify-between border-b pb-1 text-sm last:border-0">
                <span className="font-medium">{r.name || 'Anonymous'}</span>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}