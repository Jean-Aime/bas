'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Booking } from '@/lib/types';

export default function BookingsPage() {
  const { currentBusiness } = useBusiness();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (currentBusiness) loadBookings(); }, [currentBusiness]);

  const loadBookings = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase.from('bookings').select('*').eq('business_id', currentBusiness.id).order('created_at', { ascending: false });
    setBookings((data || []) as Booking[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Booking ${status}`);
    loadBookings();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">Customer booking and appointment requests</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No bookings yet. Booking requests from customer chat will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Notes</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.requested_date || 'TBD'}</TableCell>
                    <TableCell>{b.requested_time || 'TBD'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{b.notes || '—'}</TableCell>
                    <TableCell><Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'secondary'}>{b.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {b.status === 'pending' && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, 'cancelled')}>Cancel</Button>
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
