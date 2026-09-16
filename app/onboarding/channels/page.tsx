'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { PLATFORM_OPTIONS } from '@/lib/onboarding-options';
import { loadDraft, saveDraft } from '@/lib/onboarding-draft';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Globe } from 'lucide-react';

export default function OnboardingChannelsStep() {
  const router = useRouter();
  const [draft] = useState(loadDraft);
  const [channels, setChannels] = useState(draft.channels);

  const toggle = (value: string) => {
    setChannels((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(value) ? prev.platforms.filter((p) => p !== value) : [...prev.platforms, value],
    }));
  };

  return (
    <OnboardingStepShell
      title="How does your business operate?"
      description="Select the platforms you currently use. You can skip this if you don't have any."
      current={1}
      backHref="/onboarding/business"
      onNext={() => {
        saveDraft({ ...draft, channels });
        router.push('/onboarding/business-info');
      }}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PLATFORM_OPTIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => toggle(p.value)}
              className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                channels.platforms.includes(p.value) ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
              }`}
            >
              <div className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                channels.platforms.includes(p.value) ? 'border-primary bg-primary' : 'border-muted-foreground/30'
              }`}>
                {channels.platforms.includes(p.value) && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
              </div>
              <span className="text-sm font-medium">{p.label}</span>
            </button>
          ))}
        </div>
        {channels.platforms.includes('website') && (
          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="website"
                type="url"
                placeholder="https://example-business.com"
                value={channels.websiteUrl}
                onChange={(e) => setChannels({ ...channels, websiteUrl: e.target.value })}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">BAS will import public content from this URL as business knowledge.</p>
          </div>
        )}
      </div>
    </OnboardingStepShell>
  );
}