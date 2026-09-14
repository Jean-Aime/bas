'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Package, MessageSquare } from 'lucide-react';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/page-states';

interface OrderDetail {
  id: string;
  customer_id: string | null;
  conversation_id: string | null;
  product_id: string | null;
  quantity: number;
  total_amount: number;
  currency: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentBusiness } = useBusiness();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
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
      .from('orders').select('*').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setOrder(data as OrderDetail);
    if (data.customer_id) {
      const { data: c } = await supabase.from('customers').select('name').eq('id', data.customer_id).maybeSingle();
      setCustomerName(c?.name || 'Anonymous');
    }
    if (data.product_id) {
      const { data: p } = await supabase.from('products').select('name').eq('id', data.product_id).maybeSingle();
      setProductName(p?.name || null);
    }
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading order…" />;
  if (error || !order) {
    return <ErrorState message="This order does not exist in the current business." onRetry={loadAll} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon" aria-label="Back to orders"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order</h1>
          <p className="text-sm text-muted-foreground">Placed {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Badge className="ml-auto">{order.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium">{productName || 'Custom / manual order'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{order.quantity}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{order.currency} {order.total_amount.toFixed(2)}</span></div>
            {order.notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span className="max-w-[60%] text-right">{order.notes}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Last updated</span><span>{new Date(order.updated_at).toLocaleString()}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Customer & context</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              {order.customer_id ? (
                <Link href={`/dashboard/customers/${order.customer_id}`} className="font-medium text-primary hover:underline">{customerName || 'Anonymous'}</Link>
              ) : <span className="font-medium">—</span>}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source conversation</span>
              {order.conversation_id ? (
                <Link href={`/dashboard/conversations/${order.conversation_id}`} className="flex items-center gap-1 font-medium text-primary hover:underline">
                  <MessageSquare className="h-3.5 w-3.5" /> View
                </Link>
              ) : <span className="font-medium">—</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {!order.customer_id && (
        <EmptyState icon={ShoppingCart} title="No linked customer" description="This order was created without a customer record." />
      )}
    </div>
  );
}