'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { LoadingState } from '@/components/ui/page-states';
import { toast } from 'sonner';

export default function NewBookingPage() {
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [customers, setCustomers] = useState<{ id: string; name: string | null }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadOptions();
  }, [currentBusiness]);

  const loadOptions = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const [c, s] = await Promise.all([
      supabase.from('customers').select('id, name').eq('business_id', currentBusiness.id).order('name'),
      supabase.from('services').select('id, name').eq('business_id', currentBusiness.id).eq('is_active', true).order('name'),
    ]);
    setCustomers((c.data || []) as { id: string; name: string | null }[]);
    setServices((s.data || []) as { id: string; name: string }[]);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!currentBusiness) return;
    if (!serviceId) {
      toast.error('Select a service');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from('bookings').insert({
      business_id: currentBusiness.id,
      customer_id: customerId || null,
      service_id: serviceId,
      requested_date: date || null,
      requested_time: time || null,
      status: 'pending',
      notes: notes || null,
    }).select().single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Booking created');
    router.push(`/dashboard/bookings/${data.id}`);
  };

  if (loading) return <LoadingState label="Loading options…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New booking</h1>
        <p className="text-muted-foreground">Create a manual booking or appointment.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Booking details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="w-full"><SelectValue placeholder={customers.length ? 'Select a customer' : 'No customers yet'} /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name || 'Anonymous'}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Service *</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger className="w-full"><SelectValue placeholder={services.length ? 'Select a service' : 'No active services'} /></SelectTrigger>
              <SelectContent>
                {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" placeholder="Optional note" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/bookings')}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving || !serviceId}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create booking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}