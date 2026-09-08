'use client';

import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { EntityManager } from '@/components/dashboard/entity-manager';
import type { Service } from '@/lib/types';

export default function ServicesPage() {
  const { currentBusiness } = useBusiness();

  const load = async (): Promise<Service[]> => {
    if (!currentBusiness) return [];
    const { data } = await supabase.from('services').select('*').eq('business_id', currentBusiness.id).order('created_at', { ascending: false });
    return (data || []) as Service[];
  };

  const toForm = (row: Service | null) => row
    ? { name: row.name, description: row.description || '', price: String(row.price), duration: row.duration_minutes ? String(row.duration_minutes) : '' }
    : { name: '', description: '', price: '0', duration: '' };

  const save = async (form: Record<string, string>, editing: Service | null): Promise<boolean> => {
    if (!currentBusiness || !form.name) return false;
    const payload = {
      business_id: currentBusiness.id,
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price) || 0,
      currency: currentBusiness.currency,
      duration_minutes: form.duration ? parseInt(form.duration) : null,
      is_active: true,
    };
    const { error } = editing
      ? await supabase.from('services').update(payload).eq('id', editing.id)
      : await supabase.from('services').insert(payload);
    if (error) { toast.error(error.message); return false; }
    toast.success(editing ? 'Service updated' : 'Service added');
    return true;
  };

  const remove = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) { toast.error(error.message); return false; }
    toast.success('Service deleted');
    return true;
  };

  return (
    <EntityManager
      businessId={currentBusiness?.id || ''}
      title="Services"
      description="Manage your service offerings"
      entityLabel="Service"
      icon={Wrench}
      emptyMessage="No services yet. Add your first service."
      columns={[
        { header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
        { header: 'Price', render: (s) => `${s.currency} ${s.price}` },
        { header: 'Duration', render: (s) => s.duration_minutes ? `${s.duration_minutes} min` : '—' },
        { header: 'Status', render: (s) => <Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge> },
      ]}
      toForm={toForm}
      renderForm={(form, onChange) => (
        <>
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder="Haircut" /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} placeholder="Professional haircut with wash..." rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Price ({currentBusiness?.currency})</Label><Input type="number" value={form.price} onChange={(e) => onChange({ ...form, price: e.target.value })} /></div>
            <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={(e) => onChange({ ...form, duration: e.target.value })} placeholder="30" /></div>
          </div>
        </>
      )}
      load={load}
      save={save}
      remove={remove}
    />
  );
}