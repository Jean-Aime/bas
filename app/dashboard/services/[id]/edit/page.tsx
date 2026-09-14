'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { EntityForm } from '@/components/dashboard/entity-form';
import { LoadingState, ErrorState } from '@/components/ui/page-states';
import { toast } from 'sonner';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [initial, setInitial] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setInitial({
      name: data.name,
      price: String(data.price),
      duration: data.duration_minutes ? String(data.duration_minutes) : '',
      description: data.description || '',
    });
    setLoading(false);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    if (!currentBusiness) return;
    setSaving(true);
    const { error } = await supabase.from('services').update({
      name: values.name,
      price: Number(values.price) || 0,
      duration_minutes: Number(values.duration) || null,
      description: values.description || null,
    }).eq('id', id).eq('business_id', currentBusiness.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Service updated');
    router.push(`/dashboard/services/${id}`);
  };

  if (loading) return <LoadingState label="Loading service…" />;
  if (error || !initial) return <ErrorState message="This service does not exist in the current business." onRetry={loadService} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit service</h1>
        <p className="text-muted-foreground">Update the details of this service.</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <EntityForm
            fields={[
              { name: 'name', label: 'Name', required: true, placeholder: 'Haircut' },
              { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '0.00' },
              { name: 'duration', label: 'Duration (minutes)', type: 'number', placeholder: '45' },
              { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            initial={initial}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancelHref={`/dashboard/services/${id}`}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}