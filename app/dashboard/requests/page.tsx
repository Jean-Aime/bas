'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Inbox, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CustomerRequest } from '@/lib/types';

export default function RequestsPage() {
  const { currentBusiness } = useBusiness();
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (currentBusiness) loadRequests(); }, [currentBusiness]);

  const loadRequests = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase.from('requests').select('*').eq('business_id', currentBusiness.id).order('created_at', { ascending: false });
    setRequests((data || []) as CustomerRequest[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('requests').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Request ${status}`);
    loadRequests();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
        <p className="text-muted-foreground">General customer requests and inquiries</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No requests yet. Customer requests from chat will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell><Badge variant="outline">{r.request_type}</Badge></TableCell>
                    <TableCell><Badge variant={r.priority === 'urgent' ? 'destructive' : r.priority === 'high' ? 'default' : 'secondary'}>{r.priority}</Badge></TableCell>
                    <TableCell><Badge variant={r.status === 'resolved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>{r.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {r.status === 'pending' && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'in_progress')}>Start</Button>
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, 'resolved')}>Resolve</Button>
                        </div>
                      )}
                      {r.status === 'in_progress' && <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'resolved')}>Resolve</Button>}
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
