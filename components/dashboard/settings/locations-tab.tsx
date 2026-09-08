'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { BusinessLocation } from '@/lib/types';

export function LocationsTab() {
  const { currentBusiness } = useBusiness();
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BusinessLocation | null>(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', country: '', phone: '' });

  useEffect(() => {
    if (currentBusiness) loadLocations();
  }, [currentBusiness]);

  const loadLocations = async () => {
    if (!currentBusiness) return;
    const { data } = await supabase.from('business_locations').select('*').eq('business_id', currentBusiness.id).order('created_at', { ascending: false });
    setLocations((data || []) as BusinessLocation[]);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', address: '', city: '', country: '', phone: '' });
    setDialogOpen(true);
  };

  const openEdit = (loc: BusinessLocation) => {
    setEditing(loc);
    setForm({
      name: loc.name,
      address: loc.address || '',
      city: loc.city || '',
      country: loc.country || '',
      phone: loc.phone || '',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!currentBusiness || !form.name) return;
    const payload = {
      business_id: currentBusiness.id,
      name: form.name,
      address: form.address || null,
      city: form.city || null,
      country: form.country || null,
      phone: form.phone || null,
    };
    const { error } = editing
      ? await supabase.from('business_locations').update(payload).eq('id', editing.id)
      : await supabase.from('business_locations').insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? 'Location updated' : 'Location added');
    setDialogOpen(false);
    loadLocations();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('business_locations').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Location deleted');
    loadLocations();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Business Locations</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Location</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Location' : 'Add Location'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Branch" /></div>
              <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="KN 5 Rd, Kimironko" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Kigali" /></div>
                <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Rwanda" /></div>
              </div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+250 700 000 000" /></div>
              <Button onClick={save} className="w-full">{editing ? 'Update' : 'Add'} Location</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {locations.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No locations yet. Add your physical locations so the AI assistant can answer location questions.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Location</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    <p className="text-sm text-muted-foreground">{[loc.address, loc.city, loc.country].filter(Boolean).join(', ') || 'No address'}</p>
                    {loc.phone && <p className="text-xs text-muted-foreground mt-0.5">{loc.phone}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(loc)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(loc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}