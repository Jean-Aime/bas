'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Inbox, User, MessageSquare } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';

interface RequestDetail {
  id: string;
  customer_id: string | null;
  conversation_id: string | null;
  request_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentBusiness } = useBusiness();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
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
      .from('requests').select('*').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setRequest(data as RequestDetail);
    if (data.customer_id) {
      const { data: c } = await supabase.from('customers').select('name').eq('id', data.customer_id).maybeSingle();
      setCustomerName(c?.name || 'Anonymous');
    }
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading request…" />;
  if (error || !request) {
    return <ErrorState message="This request does not exist in the current business." onRetry={loadAll} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/requests">
          <Button variant="ghost" size="icon" aria-label="Back to requests"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{request.title}</h1>
          <p className="text-sm text-muted-foreground">{request.request_type.replace(/_/g, ' ')} · {new Date(request.created_at).toLocaleString()}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">{request.priority}</Badge>
          <Badge>{request.status}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Inbox className="h-4 w-4" /> Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700">{request.description || 'No description provided.'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Customer & context</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            {request.customer_id ? (
              <Link href={`/dashboard/customers/${request.customer_id}`} className="font-medium text-primary hover:underline">{customerName || 'Anonymous'}</Link>
            ) : <span className="font-medium">—</span>}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Source conversation</span>
            {request.conversation_id ? (
              <Link href={`/dashboard/conversations/${request.conversation_id}`} className="flex items-center gap-1 font-medium text-primary hover:underline">
                <MessageSquare className="h-3.5 w-3.5" /> View
              </Link>
            ) : <span className="font-medium">—</span>}
          </div>
          <div className="flex justify-between"><span className="text-muted-foreground">Last updated</span><span>{new Date(request.updated_at).toLocaleString()}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}