'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const { currentBusiness } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (currentBusiness) loadOrders(); }, [currentBusiness]);

  const loadOrders = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').eq('business_id', currentBusiness.id).order('created_at', { ascending: false });
    setOrders((data || []) as Order[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order ${status}`);
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Customer order requests</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No orders yet. Orders from customer chat will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Notes</TableHead><TableHead>Quantity</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="max-w-[200px] truncate">{o.notes || '—'}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell>{o.currency} {o.total_amount}</TableCell>
                    <TableCell><Badge variant={o.status === 'completed' ? 'default' : o.status === 'cancelled' ? 'destructive' : 'secondary'}>{o.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {o.status === 'pending' && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, 'confirmed')}>Confirm</Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(o.id, 'cancelled')}>Cancel</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
