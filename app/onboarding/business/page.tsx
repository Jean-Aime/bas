'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { BUSINESS_TYPES } from '@/lib/onboarding-options';
import { loadDraft, saveDraft } from '@/lib/onboarding-draft';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function OnboardingBusinessStep() {
  const router = useRouter();
  const [draft] = useState(loadDraft);
  const [b, setB] = useState(draft.business);

  return (
    <OnboardingStepShell
      title="Tell us about your business"
      description="This information helps BAS understand and represent your business."
      current={0}
      backHref="/onboarding"
      onNext={() => {
        saveDraft({ ...draft, business: b });
        router.push('/onboarding/channels');
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Business Name *</Label>
          <Input id="name" placeholder="e.g. Beauty Salon Kigali" value={b.name} onChange={(e) => setB({ ...b, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Business Type</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BUSINESS_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setB({ ...b, type: t.value })}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all ${
                  b.type === t.value ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <t.icon className={`h-6 w-6 ${b.type === t.value ? 'text-primary' : 'text-slate-500'}`} />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" placeholder="Rwanda" value={b.country} onChange={(e) => setB({ ...b, country: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Kigali" value={b.city} onChange={(e) => setB({ ...b, city: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <Input id="email" type="email" placeholder="info@business.com" value={b.email} onChange={(e) => setB({ ...b, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+250 700 000 000" value={b.phone} onChange={(e) => setB({ ...b, phone: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Briefly describe what your business does..." value={b.description} onChange={(e) => setB({ ...b, description: e.target.value })} rows={3} />
        </div>
      </div>
    </OnboardingStepShell>
  );
}