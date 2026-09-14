'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Wrench, MessageSquare } from 'lucide-react';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/page-states';

interface BookingDetail {
  id: string;
  customer_id: string | null;
  conversation_id: string | null;
  service_id: string | null;
  requested_date: string | null;
  requested_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentBusiness } = useBusiness();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadAll();
  }, [currentBusiness, id]);

  const loadAll = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    setError(false);
    const { data, error: err } = await supabase
      .from('bookings').select('*').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setBooking(data as BookingDetail);
    if (data.customer_id) {
      const { data: c } = await supabase.from('customers').select('name').eq('id', data.customer_id).maybeSingle();
      setCustomerName(c?.name || 'Anonymous');
    }
    if (data.service_id) {
      const { data: s } = await supabase.from('services').select('name').eq('id', data.service_id).maybeSingle();
      setServiceName(s?.name || null);
    }
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading booking…" />;
  if (error || !booking) {
    return <ErrorState message="This booking does not exist in the current business." onRetry={loadAll} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/bookings">
          <Button variant="ghost" size="icon" aria-label="Back to bookings"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking</h1>
          <p className="text-sm text-muted-foreground">Requested {new Date(booking.created_at).toLocaleString()}</p>
        </div>
        <Badge className="ml-auto">{booking.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{serviceName || 'Custom / manual booking'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{booking.requested_date ? new Date(booking.requested_date).toLocaleDateString() : 'TBD'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{booking.requested_time || 'TBD'}</span></div>
            {booking.notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span className="max-w-[60%] text-right">{booking.notes}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Last updated</span><span>{new Date(booking.updated_at).toLocaleString()}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Customer & context</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              {booking.customer_id ? (
                <Link href={`/dashboard/customers/${booking.customer_id}`} className="font-medium text-primary hover:underline">{customerName || 'Anonymous'}</Link>
              ) : <span className="font-medium">—</span>}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source conversation</span>
              {booking.conversation_id ? (
                <Link href={`/dashboard/conversations/${booking.conversation_id}`} className="flex items-center gap-1 font-medium text-primary hover:underline">
                  <MessageSquare className="h-3.5 w-3.5" /> View
                </Link>
              ) : <span className="font-medium">—</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {!booking.customer_id && (
        <EmptyState icon={CalendarDays} title="No linked customer" description="This booking was created without a customer record." />
      )}
    </div>
  );
}