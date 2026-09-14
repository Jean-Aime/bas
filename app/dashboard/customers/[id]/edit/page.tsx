'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { EntityForm } from '@/components/dashboard/entity-form';
import { LoadingState, ErrorState } from '@/components/ui/page-states';
import { toast } from 'sonner';

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [initial, setInitial] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadCustomer();
  }, [currentBusiness, id]);

  const loadCustomer = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('customers').select('*').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setInitial({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
    });
    setLoading(false);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    if (!currentBusiness) return;
    setSaving(true);
    const { error } = await supabase.from('customers').update({
      name: values.name || null,
      email: values.email || null,
      phone: values.phone || null,
    }).eq('id', id).eq('business_id', currentBusiness.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Customer updated');
    router.push(`/dashboard/customers/${id}`);
  };

  if (loading) return <LoadingState label="Loading customer…" />;
  if (error || !initial) return <ErrorState message="This customer does not exist in the current business." onRetry={loadCustomer} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit customer</h1>
        <p className="text-muted-foreground">Update this customer&apos;s contact information.</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <EntityForm
            fields={[
              { name: 'name', label: 'Name', placeholder: 'Alice Uwase' },
              { name: 'email', label: 'Email', placeholder: 'alice@example.com' },
              { name: 'phone', label: 'Phone', placeholder: '+250 700 000 000' },
            ]}
            initial={initial}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancelHref={`/dashboard/customers/${id}`}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}