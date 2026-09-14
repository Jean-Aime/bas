'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { loadDraft, saveDraft } from '@/lib/onboarding-draft';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Package } from 'lucide-react';

export default function OnboardingProductsStep() {
  const router = useRouter();
  const [draft] = useState(loadDraft);
  const [products, setProducts] = useState(draft.products);

  const update = (i: number, field: 'name' | 'price' | 'description', value: string) => {
    setProducts((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  return (
    <OnboardingStepShell
      title="Add your products"
      description="Optional — add a few products now, or skip and configure them later in the dashboard."
      current={3}
      backHref="/onboarding/business-info"
      onNext={() => {
        saveDraft({ ...draft, products });
        router.push('/onboarding/services');
      }}
    >
      <div className="space-y-3">
        {products.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
            <Package className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No products yet — add your first one below.</p>
          </div>
        )}
        {products.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_auto] items-end gap-3 rounded-lg border p-3">
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input placeholder="Black sneakers" value={p.name} onChange={(e) => update(i, 'name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Price</Label>
              <Input placeholder="0.00" value={p.price} onChange={(e) => update(i, 'price', e.target.value)} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setProducts((prev) => prev.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setProducts((prev) => [...prev, { name: '', price: '', description: '' }])}>
          <Plus className="mr-2 h-4 w-4" /> Add product
        </Button>
      </div>
    </OnboardingStepShell>
  );
}