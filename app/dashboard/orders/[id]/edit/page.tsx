'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';
import { toast } from 'sonner';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadOrder();
  }, [currentBusiness, id]);

  const loadOrder = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('orders').select('status, notes').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setStatus(data.status);
    setNotes(data.notes || '');
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!currentBusiness) return;
    setSaving(true);
    const { error } = await supabase.from('orders').update({ status, notes: notes || null })
      .eq('id', id).eq('business_id', currentBusiness.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Order updated');
    router.push(`/dashboard/orders/${id}`);
  };

  if (loading) return <LoadingState label="Loading order…" />;
  if (error) return <ErrorState message="This order does not exist in the current business." onRetry={loadOrder} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit order</h1>
        <p className="text-muted-foreground">Update status and notes.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Order details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => router.push(`/dashboard/orders/${id}`)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}