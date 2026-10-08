'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, authHeaders } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap, Globe, CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  Sparkles, Building2, Shirt, Scissors, Hotel, UtensilsCrossed,
  Heart, Briefcase, Check,
} from 'lucide-react';
import { BUSINESS_TYPES, PLATFORM_OPTIONS } from '@/lib/onboarding-options';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STEPS = [
  { n: 1, label: 'Business' },
  { n: 2, label: 'Platform' },
  { n: 3, label: 'Review' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'RWF', label: 'RWF — Rwandan Franc' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'KES', label: 'KES — Kenyan Shilling' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'GHS', label: 'GHS — Ghanaian Cedi' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { refreshBusinesses } = useBusiness();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('general');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user?.email) setEmail(user.email);
  }, [user, authLoading, router]);

  const togglePlatform = (v: string) =>
    setPlatforms((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({ name: businessName, type: businessType, country, city, email, phone, description, website_url: websiteUrl || null, currency, status: 'active' })
        .select().single();
      if (bizError) throw bizError;

      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({ user_id: user.id, business_id: business.id, role: 'business_owner' });
      if (membershipError) throw membershipError;

      for (const day of [0, 1, 2, 3, 4, 5, 6]) {
        const isWeekend = day === 0 || day === 6;
        await supabase.from('business_hours').insert({
          business_id: business.id, day_of_week: day,
          open_time: isWeekend ? null : '09:00',
          close_time: isWeekend ? null : '18:00',
          is_closed: isWeekend,
        });
      }

      await refreshBusinesses();
      toast.success('Business created! Welcome to BAS.');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Seed failed');
      toast.success(data.message || 'Demo businesses created!');
      await refreshBusinesses();
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create demo data');
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Nav */}
      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-fill shadow-sm">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">BAS</span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1">
                <div className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all',
                  step > s.n ? 'brand-fill text-white' :
                  step === s.n ? 'bg-primary/15 text-primary border border-primary/30' :
                  'bg-muted text-muted-foreground'
                )}>
                  {step > s.n ? <Check className="h-3 w-3" /> : s.n}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:inline',
                  step === s.n ? 'text-foreground' : 'text-muted-foreground'
                )}>{s.label}</span>
                {i < STEPS.length - 1 && (
                  <div className={cn('mx-1 h-px w-6 transition-colors', step > s.n ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-5 py-10">

        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-in-up space-y-6">
            <div>
              <h1 className="text-heading text-foreground mb-1">Tell us about your business</h1>
              <p className="text-sm text-muted-foreground">This helps BAS understand and represent your business accurately.</p>
            </div>

            {/* Demo shortcut */}
            <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Explore with demo data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Creates 3 demo businesses with products, services, FAQs, and workflows.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSeedDemo} disabled={seeding} className="shrink-0">
                {seeding ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                Load demo
              </Button>
            </div>

            <div className="surface-raised rounded-2xl p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Business name *</Label>
                <Input
                  placeholder="e.g. Beauty Salon Kigali"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11 bg-[hsl(var(--surface-1))] border-border/80"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Business type</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {BUSINESS_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setBusinessType(t.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-150',
                        businessType === t.value
                          ? 'border-primary bg-primary/8 text-primary'
                          : 'border-border/60 hover:border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <t.icon className="h-5 w-5" />
                      <span className="text-[11px] font-medium leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Country</Label>
                  <Input placeholder="Rwanda" value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 bg-[hsl(var(--surface-1))] border-border/80" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">City</Label>
                  <Input placeholder="Kigali" value={city} onChange={(e) => setCity(e.target.value)} className="h-11 bg-[hsl(var(--surface-1))] border-border/80" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Business email</Label>
                  <Input type="email" placeholder="info@business.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-[hsl(var(--surface-1))] border-border/80" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Phone</Label>
                  <Input placeholder="+250 700 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 bg-[hsl(var(--surface-1))] border-border/80" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Currency</Label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-border/80 bg-[hsl(var(--surface-1))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  placeholder="Briefly describe what your business does…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-[hsl(var(--surface-1))] border-border/80 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!businessName} className="brand-fill border-0 shadow-sm h-11 px-6 font-semibold">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-in-up space-y-6">
            <div>
              <h1 className="text-heading text-foreground mb-1">How does your business operate?</h1>
              <p className="text-sm text-muted-foreground">Select the platforms you use. You can skip this and configure later.</p>
            </div>

            <div className="surface-raised rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {PLATFORM_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => togglePlatform(p.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150',
                      platforms.includes(p.value)
                        ? 'border-primary bg-primary/8'
                        : 'border-border/60 hover:border-border'
                    )}
                  >
                    <div className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
                      platforms.includes(p.value) ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    )}>
                      {platforms.includes(p.value) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={cn('text-sm font-medium', platforms.includes(p.value) ? 'text-primary' : 'text-foreground')}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>

              {platforms.includes('website') && (
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <Label className="text-sm font-medium">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      type="url"
                      placeholder="https://your-business.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="pl-10 h-11 bg-[hsl(var(--surface-1))] border-border/80"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">BAS will import public content from this URL as business knowledge.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="h-11 px-5">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)} className="brand-fill border-0 shadow-sm h-11 px-6 font-semibold">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-in-up space-y-6">
            <div>
              <h1 className="text-heading text-foreground mb-1">Review and create</h1>
              <p className="text-sm text-muted-foreground">Confirm your details. You can change everything from the dashboard.</p>
            </div>

            <div className="surface-raised rounded-2xl p-6 space-y-3">
              {[
                { label: 'Business name', value: businessName },
                { label: 'Type', value: BUSINESS_TYPES.find((t) => t.value === businessType)?.label ?? businessType },
                { label: 'Location', value: [city, country].filter(Boolean).join(', ') || '—' },
                { label: 'Email', value: email || '—' },
                { label: 'Phone', value: phone || '—' },
                { label: 'Currency', value: currency },
                ...(websiteUrl ? [{ label: 'Website', value: websiteUrl }] : []),
                { label: 'Platforms', value: platforms.length > 0 ? platforms.join(', ') : 'None selected' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                After creating your business, you can add products, services, FAQs, policies, and connect integrations from the dashboard.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="h-11 px-5">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleCreate} disabled={loading || !businessName} className="brand-fill border-0 shadow-sm h-11 px-6 font-semibold">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Create business
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
