'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { EntityForm } from '@/components/dashboard/entity-form';
import { LoadingState, ErrorState } from '@/components/ui/page-states';
import { toast } from 'sonner';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [initial, setInitial] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadProduct();
  }, [currentBusiness, id]);

  const loadProduct = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('products').select('*').eq('id', id).eq('business_id', currentBusiness.id).maybeSingle();
    if (err || !data) {
      setError(true);
      setLoading(false);
      return;
    }
    setInitial({
      name: data.name,
      price: String(data.price),
      sku: data.sku || '',
      stock: String(data.stock),
      description: data.description || '',
    });
    setLoading(false);
  };

  const handleSubmit = async (values: Record<string, string>) => {
    if (!currentBusiness) return;
    setSaving(true);
    const { error } = await supabase.from('products').update({
      name: values.name,
      price: Number(values.price) || 0,
      sku: values.sku || null,
      description: values.description || null,
      stock: Number(values.stock) || 0,
    }).eq('id', id).eq('business_id', currentBusiness.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Product updated');
    router.push(`/dashboard/products/${id}`);
  };

  if (loading) return <LoadingState label="Loading product…" />;
  if (error || !initial) return <ErrorState message="This product does not exist in the current business." onRetry={loadProduct} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit product</h1>
        <p className="text-muted-foreground">Update the details of this product.</p>
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
            initial={initial}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancelHref={`/dashboard/products/${id}`}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}