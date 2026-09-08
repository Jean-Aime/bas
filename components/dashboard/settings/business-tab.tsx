'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function BusinessTab() {
  const { currentBusiness, refreshBusinesses } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', email: '', phone: '', country: '', city: '', website_url: '', currency: 'USD' });

  useEffect(() => {
    if (currentBusiness) {
      setForm({
        name: currentBusiness.name,
        description: currentBusiness.description || '',
        email: currentBusiness.email || '',
        phone: currentBusiness.phone || '',
        country: currentBusiness.country || '',
        city: currentBusiness.city || '',
        website_url: currentBusiness.website_url || '',
        currency: currentBusiness.currency,
      });
    }
  }, [currentBusiness]);

  const handleSave = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { error } = await supabase.from('businesses').update({
      name: form.name,
      description: form.description || null,
      email: form.email || null,
      phone: form.phone || null,
      country: form.country || null,
      city: form.city || null,
      website_url: form.website_url || null,
      currency: form.currency,
      updated_at: new Date().toISOString(),
    }).eq('id', currentBusiness.id);
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success('Settings saved');
    refreshBusinesses();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Business Information</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label>Business Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
          <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Website URL</Label><Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></div>
          <div className="space-y-2"><Label>Currency</Label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="USD">USD ($)</option><option value="RWF">RWF</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="KES">KES</option><option value="NGN">NGN</option>
            </select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}