'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { loadDraft, saveDraft } from '@/lib/onboarding-draft';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Wrench } from 'lucide-react';

export default function OnboardingServicesStep() {
  const router = useRouter();
  const [draft] = useState(loadDraft);
  const [services, setServices] = useState(draft.services);

  const update = (i: number, field: 'name' | 'price' | 'duration', value: string) => {
    setServices((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  return (
    <OnboardingStepShell
      title="Add your services"
      description="Optional — services like haircuts, consultations, or rooms. Add them now or later from the dashboard."
      current={4}
      backHref="/onboarding/products"
      onNext={() => {
        saveDraft({ ...draft, services });
        router.push('/onboarding/knowledge');
      }}
    >
      <div className="space-y-3">
        {services.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
            <Wrench className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No services yet — add your first one below.</p>
          </div>
        )}
        {services.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_90px_auto] items-end gap-3 rounded-lg border p-3">
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input placeholder="Haircut" value={s.name} onChange={(e) => update(i, 'name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Price</Label>
              <Input placeholder="0.00" value={s.price} onChange={(e) => update(i, 'price', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Minutes</Label>
              <Input placeholder="45" value={s.duration} onChange={(e) => update(i, 'duration', e.target.value)} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setServices((prev) => prev.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setServices((prev) => [...prev, { name: '', price: '', duration: '' }])}>
          <Plus className="mr-2 h-4 w-4" /> Add service
        </Button>
      </div>
    </OnboardingStepShell>
  );
}