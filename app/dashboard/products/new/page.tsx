'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { EntityForm } from '@/components/dashboard/entity-form';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, string>) => {
    if (!currentBusiness) return;
    setLoading(true);
    const { error } = await supabase.from('products').insert({
      business_id: currentBusiness.id,
      name: values.name,
      price: Number(values.price) || 0,
      currency: currentBusiness.currency,
      sku: values.sku || null,
      description: values.description || null,
      stock: Number(values.stock) || 0,
      is_active: true,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Product created');
    router.push('/dashboard/products');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New product</h1>
        <p className="text-muted-foreground">Add a product to your catalog.</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <EntityForm
            fields={[
              { name: 'name', label: 'Name', required: true, placeholder: 'Black sneakers' },
              { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '0.00' },
              { name: 'sku', label: 'SKU', placeholder: 'BS-42' },
              { name: 'stock', label: 'Stock', type: 'number', placeholder: '0' },
              { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            initial={{}}
            submitLabel="Create product"
            onSubmit={handleSubmit}
            onCancelHref="/dashboard/products"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}