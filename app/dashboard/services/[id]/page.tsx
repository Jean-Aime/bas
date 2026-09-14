'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench, Pencil } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/page-states';

interface ServiceDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentBusiness } = useBusiness();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadService();
  }, [currentBusiness, id]);

  const loadService = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('services').select('*').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setService(data as ServiceDetail);
    setLoading(false);
  };

  if (loading) return <LoadingState label="Loading service…" />;
  if (error || !service) return <ErrorState message="This service does not exist in the current business." onRetry={loadService} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/services">
          <Button variant="ghost" size="icon" aria-label="Back to services"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{service.name}</h1>
          <p className="text-sm text-muted-foreground">Added {new Date(service.created_at).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={service.is_active ? 'default' : 'secondary'}>{service.is_active ? 'Active' : 'Inactive'}</Badge>
          <Link href={`/dashboard/services/${service.id}/edit`}>
            <Button size="sm" variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-medium">{service.currency} {service.price.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{service.duration_minutes ? `${service.duration_minutes} minutes` : '—'}</span></div>
          {service.description && <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span className="max-w-[60%] text-right">{service.description}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Last updated</span><span>{new Date(service.updated_at).toLocaleString()}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}