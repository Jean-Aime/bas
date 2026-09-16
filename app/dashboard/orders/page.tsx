'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { fetchOrders, updateOrderStatus } from '@/lib/services/crm-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { ShoppingCart, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Order } from '@/lib/types';

export default function OrdersPage() {
  const { currentBusiness } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const rows = await fetchOrders(currentBusiness.id);
    setOrders(rows);
    setLoading(false);
  }, [currentBusiness]);

  useEffect(() => { reload(); }, [reload]);

  const handleStatus = async (id: string, status: string) => {
    const { error } = await updateOrderStatus(id, status);
    if (error) { toast.error(error); return; }
    toast.success(`Order ${status}`);
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Customer order requests from chat" />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <PackageOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-medium">No orders yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                When customers request orders in chat, they land here for your team to confirm and fulfill.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Notes</TableHead><TableHead>Qty</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
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
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/orders/${o.id}`}><Button size="sm" variant="ghost">View</Button></Link>
                        {o.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleStatus(o.id, 'confirmed')}>Confirm</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleStatus(o.id, 'cancelled')}>Cancel</Button>
                          </>
                        )}
                      </div>
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
