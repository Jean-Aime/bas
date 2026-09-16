'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { loadDraft, saveDraft } from '@/lib/onboarding-draft';
import { WORKFLOW_TEMPLATES } from '@/lib/workflow/templates';
import { CheckCircle2, Workflow } from 'lucide-react';

export default function OnboardingAutomationStep() {
  const router = useRouter();
  const [draft] = useState(loadDraft);
  const [selected, setSelected] = useState<string[]>(draft.automation.length > 0 ? draft.automation : WORKFLOW_TEMPLATES.slice(0, 3).map((t) => t.id));

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  return (
    <OnboardingStepShell
      title="Choose your automation"
      description="Select workflow templates to activate for your business. You can edit them later in Automation."
      current={6}
      backHref="/onboarding/knowledge"
      onNext={() => {
        saveDraft({ ...draft, automation: selected });
        router.push('/onboarding/complete');
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {WORKFLOW_TEMPLATES.map((t) => {
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                active ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
              }`}
            >
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                active ? 'border-primary bg-primary' : 'border-muted-foreground/30'
              }`}>
                {active && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Workflow className="h-4 w-4 text-primary" /> {t.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </OnboardingStepShell>
  );
}