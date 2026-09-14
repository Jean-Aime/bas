'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { loadDraft, saveDraft } from '@/lib/onboarding-draft';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

export default function OnboardingKnowledgeStep() {
  const router = useRouter();
  const [draft] = useState(loadDraft);
  const [knowledge, setKnowledge] = useState(draft.knowledge);

  const update = (i: number, field: 'question' | 'answer', value: string) => {
    setKnowledge((prev) => prev.map((k, idx) => (idx === i ? { ...k, [field]: value } : k)));
  };

  return (
    <OnboardingStepShell
      title="Add business knowledge"
      description="Optional — add an FAQ the assistant can answer from. Policies and more FAQs can be added later in Knowledge."
      current={5}
      backHref="/onboarding/services"
      onNext={() => {
        saveDraft({ ...draft, knowledge });
        router.push('/onboarding/automation');
      }}
    >
      <div className="space-y-3">
        {knowledge.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No FAQs yet — add your first one below.</p>
          </div>
        )}
        {knowledge.map((k, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-3">
            <div className="space-y-2">
              <Label className="text-xs">Question</Label>
              <Input placeholder="Do you take walk-ins?" value={k.question} onChange={(e) => update(i, 'question', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Answer</Label>
              <Textarea rows={2} placeholder="Yes, but appointments are recommended on weekends." value={k.answer} onChange={(e) => update(i, 'answer', e.target.value)} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setKnowledge((prev) => prev.filter((_, idx) => idx !== i))}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setKnowledge((prev) => [...prev, { question: '', answer: '' }])}>
          <Plus className="mr-2 h-4 w-4" /> Add FAQ
        </Button>
      </div>
    </OnboardingStepShell>
  );
}