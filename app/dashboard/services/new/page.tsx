'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { EntityForm } from '@/components/dashboard/entity-form';
import { toast } from 'sonner';

export default function NewServicePage() {
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, string>) => {
    if (!currentBusiness) return;
    setLoading(true);
    const { error } = await supabase.from('services').insert({
      business_id: currentBusiness.id,
      name: values.name,
      price: Number(values.price) || 0,
      currency: currentBusiness.currency,
      duration_minutes: Number(values.duration) || null,
      description: values.description || null,
      is_active: true,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Service created');
    router.push('/dashboard/services');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New service</h1>
        <p className="text-muted-foreground">Add a service your customers can book or ask about.</p>
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
            initial={{}}
            submitLabel="Create service"
            onSubmit={handleSubmit}
            onCancelHref="/dashboard/services"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}