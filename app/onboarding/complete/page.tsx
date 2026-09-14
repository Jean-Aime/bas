'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { loadDraft, clearDraft } from '@/lib/onboarding-draft';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { BUSINESS_TYPES } from '@/lib/onboarding-options';
import { WORKFLOW_TEMPLATES } from '@/lib/workflow/templates';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingCompleteStep() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshBusinesses } = useBusiness();
  const [draft] = useState(loadDraft);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    const { business: b, channels, hours, products, services, knowledge, automation } = draft;
    if (!b.name) {
      toast.error('Business name is required');
      router.push('/onboarding/business');
      return;
    }
    setLoading(true);
    try {
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({
          name: b.name,
          type: b.type,
          country: b.country || null,
          city: b.city || null,
          email: b.email || null,
          phone: b.phone || null,
          description: b.description || null,
          website_url: channels.websiteUrl || null,
          currency: b.currency,
          status: 'active',
        })
        .select()
        .single();
      if (bizError) throw bizError;

      const { error: membershipError } = await supabase.from('memberships').insert({
        user_id: user.id,
        business_id: business.id,
        role: 'business_owner',
      });
      if (membershipError) throw membershipError;

      const days = [0, 1, 2, 3, 4, 5, 6];
      for (const day of days) {
        const closed = hours.closedWeekends && (day === 0 || day === 6);
        await supabase.from('business_hours').insert({
          business_id: business.id,
          day_of_week: day,
          open_time: closed ? null : hours.open,
          close_time: closed ? null : hours.close,
          is_closed: closed,
        });
      }

      for (const p of products.filter((x) => x.name)) {
        await supabase.from('products').insert({
          business_id: business.id,
          name: p.name,
          price: Number(p.price) || 0,
          description: p.description || null,
          currency: b.currency,
          is_active: true,
        });
      }

      for (const s of services.filter((x) => x.name)) {
        await supabase.from('services').insert({
          business_id: business.id,
          name: s.name,
          price: Number(s.price) || 0,
          description: null,
          duration_minutes: Number(s.duration) || null,
          currency: b.currency,
          is_active: true,
        });
      }

      for (const k of knowledge.filter((x) => x.question)) {
        await supabase.from('faqs').insert({
          business_id: business.id,
          question: k.question,
          answer: k.answer,
          category: 'general',
          is_published: true,
        });
      }

      for (const tpl of WORKFLOW_TEMPLATES.filter((t) => automation.includes(t.id))) {
        await supabase.from('workflows').insert({
          business_id: business.id,
          name: tpl.name,
          description: tpl.description,
          trigger_type: tpl.trigger_type,
          trigger_condition: { intent: tpl.trigger_intent },
          steps: tpl.steps,
          status: 'active',
          version: 1,
          is_template: false,
          template_id: tpl.id,
        });
      }

      clearDraft();
      await refreshBusinesses();
      toast.success('Business created successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = BUSINESS_TYPES.find((t) => t.value === draft.business.type)?.label;

  return (
    <OnboardingStepShell
      title="Review and create"
      description="Confirm your business details. Everything can be changed later from the dashboard."
      current={7}
      backHref="/onboarding/automation"
      nextLabel={loading ? 'Creating…' : 'Create Business'}
      onNext={handleCreate}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border bg-slate-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{draft.business.name || 'Unnamed business'}</p>
            <p className="text-sm text-muted-foreground">{typeLabel} · {draft.business.city || '—'}, {draft.business.country || '—'}</p>
          </div>
        </div>
        <div className="space-y-3 rounded-lg border p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Channels</span><span className="font-medium">{draft.channels.platforms.length > 0 ? draft.channels.platforms.join(', ') : 'None'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Products</span><span className="font-medium">{draft.products.filter((p) => p.name).length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Services</span><span className="font-medium">{draft.services.filter((s) => s.name).length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">FAQs</span><span className="font-medium">{draft.knowledge.filter((k) => k.question).length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Automations</span><span className="font-medium">{draft.automation.length} template{draft.automation.length === 1 ? '' : 's'}</span></div>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Creating your business…
          </div>
        )}
        <Button className="w-full" onClick={handleCreate} disabled={loading || !draft.business.name}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          Create Business
        </Button>
      </div>
    </OnboardingStepShell>
  );
}