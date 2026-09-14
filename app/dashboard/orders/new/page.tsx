'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { LoadingState } from '@/components/ui/page-states';
import { toast } from 'sonner';

export default function NewOrderPage() {
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [customers, setCustomers] = useState<{ id: string; name: string | null }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadOptions();
  }, [currentBusiness]);

  const loadOptions = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const [c, p] = await Promise.all([
      supabase.from('customers').select('id, name').eq('business_id', currentBusiness.id).order('name'),
      supabase.from('products').select('id, name, price').eq('business_id', currentBusiness.id).eq('is_active', true).order('name'),
    ]);
    setCustomers((c.data || []) as { id: string; name: string | null }[]);
    setProducts((p.data || []) as { id: string; name: string; price: number }[]);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!currentBusiness) return;
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error('Select a product');
      return;
    }
    const qty = Number(quantity) || 1;
    setSaving(true);
    const { data, error } = await supabase.from('orders').insert({
      business_id: currentBusiness.id,
      customer_id: customerId || null,
      product_id: product.id,
      quantity: qty,
      total_amount: product.price * qty,
      currency: currentBusiness.currency,
      status: 'pending',
      notes: notes || null,
    }).select().single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Order created');
    router.push(`/dashboard/orders/${data.id}`);
  };

  if (loading) return <LoadingState label="Loading options…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New order</h1>
        <p className="text-muted-foreground">Create a manual order for a customer.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Order details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="w-full"><SelectValue placeholder={customers.length ? 'Select a customer' : 'No customers yet'} /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name || 'Anonymous'}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Product *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-full"><SelectValue placeholder={products.length ? 'Select a product' : 'No active products'} /></SelectTrigger>
              <SelectContent>
                {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {currentBusiness?.currency} {p.price.toFixed(2)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" placeholder="Optional note" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/orders')}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving || !productId}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}