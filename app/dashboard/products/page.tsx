'use client';

import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { EntityManager } from '@/components/dashboard/entity-manager';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const { currentBusiness } = useBusiness();

  const load = async (): Promise<Product[]> => {
    if (!currentBusiness) return [];
    const { data } = await supabase.from('products').select('*').eq('business_id', currentBusiness.id).order('created_at', { ascending: false });
    return (data || []) as Product[];
  };

  const toForm = (row: Product | null) => row
    ? { name: row.name, description: row.description || '', price: String(row.price), stock: String(row.stock) }
    : { name: '', description: '', price: '0', stock: '0' };

  const save = async (form: Record<string, string>, editing: Product | null): Promise<boolean> => {
    if (!currentBusiness || !form.name) return false;
    const payload = {
      business_id: currentBusiness.id,
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      currency: currentBusiness.currency,
      is_active: true,
    };
    const { error } = editing
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload);
    if (error) { toast.error(error.message); return false; }
    toast.success(editing ? 'Product updated' : 'Product added');
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error(error.message); return false; }
    toast.success('Product deleted');
    return true;
  };

  return (
    <EntityManager
      businessId={currentBusiness?.id || ''}
      title="Products"
      description="Manage your product catalog"
      entityLabel="Product"
      icon={Package}
      emptyMessage="No products yet. Add your first product."
      columns={[
        { header: 'Name', render: (p) => <span className="font-medium">{p.name}</span> },
        { header: 'Price', render: (p) => `${p.currency} ${p.price}` },
        { header: 'Stock', render: (p) => p.stock },
        { header: 'Status', render: (p) => <Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge> },
      ]}
      toForm={toForm}
      renderForm={(form, onChange) => (
        <>
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder="Black Sneakers" /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} placeholder="Premium leather sneakers..." rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Price ({currentBusiness?.currency})</Label><Input type="number" value={form.price} onChange={(e) => onChange({ ...form, price: e.target.value })} /></div>
            <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => onChange({ ...form, stock: e.target.value })} /></div>
          </div>
        </>
      )}
      load={load}
      save={save}
      remove={remove}
    />
  );
}