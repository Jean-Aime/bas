'use client';

import { useEffect, useState, useCallback } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { fetchBookings, updateBookingStatus } from '@/lib/services/crm-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Calendar, CalendarOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Booking } from '@/lib/types';

export default function BookingsPage() {
  const { currentBusiness } = useBusiness();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const rows = await fetchBookings(currentBusiness.id);
    setBookings(rows);
    setLoading(false);
  }, [currentBusiness]);

  useEffect(() => { reload(); }, [reload]);

  const handleStatus = async (id: string, status: string) => {
    const { error } = await updateBookingStatus(id, status);
    if (error) { toast.error(error); return; }
    toast.success(`Booking ${status}`);
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Customer booking and appointment requests" />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <CalendarOff className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-medium">No bookings yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
    Appointment requests from customer chat appear here for confirmation.
              </p>
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
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/bookings/${b.id}`}><Button size="sm" variant="ghost">View</Button></Link>
                        {b.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleStatus(b.id, 'confirmed')}>Confirm</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleStatus(b.id, 'cancelled')}>Cancel</Button>
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
