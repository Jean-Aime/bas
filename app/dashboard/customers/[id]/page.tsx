'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MessageSquare, ShoppingCart, CalendarDays, Inbox } from 'lucide-react';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/page-states';

interface CustomerDetail {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentBusiness } = useBusiness();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [conversations, setConversations] = useState<{ id: string; status: string; channel: string; detected_intent: string | null; created_at: string }[]>([]);
  const [orders, setOrders] = useState<{ id: string; total_amount: number; currency: string; status: string; created_at: string }[]>([]);
  const [bookings, setBookings] = useState<{ id: string; requested_date: string | null; status: string; created_at: string }[]>([]);
  const [requests, setRequests] = useState<{ id: string; request_type: string; title: string; status: string; priority: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadAll();
  }, [currentBusiness, id]);

  const loadAll = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    setError(false);
    const { data: cust, error: custErr } = await supabase
      .from('customers').select('*').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (custErr || !cust) {
      setError(true);
      setLoading(false);
      return;
    }
    setCustomer(cust as CustomerDetail);
    const [conv, ord, bok, req] = await Promise.all([
      supabase.from('conversations').select('id, status, channel, detected_intent, created_at').eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('orders').select('id, total_amount, currency, status, created_at').eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('bookings').select('id, requested_date, status, created_at').eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('requests').select('id, request_type, title, status, priority, created_at').eq('customer_id', id).order('created_at', { ascending: false }),
    ]);
    setConversations((conv.data || []) as typeof conversations);
    setOrders((ord.data || []) as typeof orders);
    setBookings((bok.data || []) as typeof bookings);
    setRequests((req.data || []) as typeof requests);
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading customer…" />;
  if (error || !customer) {
    return (
      <ErrorState
        message="This customer does not exist in the current business."
        onRetry={loadAll}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/customers">
            <Button variant="ghost" size="icon" aria-label="Back to customers"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{customer.name || 'Anonymous customer'}</h1>
            <p className="text-sm text-muted-foreground">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {customer.email || 'No email'}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {customer.phone || 'No phone'}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Conversations ({conversations.length})</CardTitle></CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No conversations yet" description="Chat messages from this customer will appear here." />
            ) : (
              <div className="space-y-2">
                {conversations.map((c) => (
                  <Link key={c.id} href={`/dashboard/conversations/${c.id}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{c.channel}</Badge>
                      <span className="text-muted-foreground">{c.detected_intent || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{c.status}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Orders ({orders.length})</CardTitle></CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="No orders" />
            ) : (
              <div className="space-y-2">
                {orders.map((o) => (
                  <Link key={o.id} href={`/dashboard/orders/${o.id}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
                    <span className="font-medium">{o.currency} {o.total_amount.toFixed(2)}</span>
                    <div className="flex items-center gap-2">
                      <Badge>{o.status}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Bookings ({bookings.length})</CardTitle></CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No bookings" />
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <Link key={b.id} href={`/dashboard/bookings/${b.id}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
                    <span className="font-medium">{b.requested_date ? new Date(b.requested_date).toLocaleDateString() : 'Date TBD'}</span>
                    <div className="flex items-center gap-2">
                      <Badge>{b.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Requests ({requests.length})</CardTitle></CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <EmptyState icon={Inbox} title="No requests" />
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <Link key={r.id} href={`/dashboard/requests/${r.id}`} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.request_type.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge>{r.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}