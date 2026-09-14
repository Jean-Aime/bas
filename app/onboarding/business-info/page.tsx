'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { loadDraft, saveDraft } from '@/lib/onboarding-draft';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function OnboardingBusinessInfoStep() {
  const router = useRouter();
  const [draft] = useState(loadDraft);
  const [hours, setHours] = useState(draft.hours);

  return (
    <OnboardingStepShell
      title="Configure business information"
      description="Working hours, locations, policies, and payment details can be added any time from Settings. Set your default opening hours here."
      current={2}
      backHref="/onboarding/channels"
      onNext={() => {
        saveDraft({ ...draft, hours });
        router.push('/onboarding/products');
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="open">Opening time</Label>
            <Input id="open" type="time" value={hours.open} onChange={(e) => setHours({ ...hours, open: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close">Closing time</Label>
            <Input id="close" type="time" value={hours.close} onChange={(e) => setHours({ ...hours, close: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Closed on weekends</p>
            <p className="text-xs text-muted-foreground">Most businesses close Saturday and Sunday.</p>
          </div>
          <Switch checked={hours.closedWeekends} onCheckedChange={(v) => setHours({ ...hours, closedWeekends: v })} />
        </div>
      </div>
    </OnboardingStepShell>
  );
}