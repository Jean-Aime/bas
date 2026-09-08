'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Building2, Globe, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Store, Scissors, Hotel, UtensilsCrossed, Heart, Briefcase, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  { value: 'clothing_store', label: 'Clothing Store', icon: Store },
  { value: 'salon', label: 'Salon / Beauty', icon: Scissors },
  { value: 'hotel', label: 'Hotel / Hospitality', icon: Hotel },
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'ngo', label: 'NGO / Non-profit', icon: Heart },
  { value: 'professional', label: 'Professional Services', icon: Briefcase },
  { value: 'general', label: 'Other Business', icon: Building2 },
];

const PLATFORM_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'ecommerce', label: 'E-commerce (Shopify, WooCommerce)' },
  { value: 'whatsapp', label: 'WhatsApp Business' },
  { value: 'booking', label: 'Booking System' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'none', label: 'No digital platform' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { refreshBusinesses } = useBusiness();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user?.email) setEmail(user.email);
  }, [user, authLoading, router]);

  const togglePlatform = (value: string) => {
    setPlatforms((prev) => prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]);
  };

  const handleCreateBusiness = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          type: businessType,
          country,
          city,
          email,
          phone,
          description,
          website_url: websiteUrl || null,
          currency,
          status: 'active',
        })
        .select()
        .single();

      if (bizError) throw bizError;

      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: user.id,
          business_id: business.id,
          role: 'business_owner',
        });

      if (membershipError) throw membershipError;

      const days = [0, 1, 2, 3, 4, 5, 6];
      for (const day of days) {
        const isWeekend = day === 0 || day === 6;
        await supabase.from('business_hours').insert({
          business_id: business.id,
          day_of_week: day,
          open_time: isWeekend ? null : '09:00',
          close_time: isWeekend ? null : '18:00',
          is_closed: isWeekend,
        });
      }

      await refreshBusinesses();
      toast.success('Business created successfully!');
      router.push('/dashboard');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create business';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Seed failed');
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-bold">BAS</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? 'font-semibold text-primary' : ''}>1. Business</span>
            <ArrowRight className="h-3 w-3" />
            <span className={step >= 2 ? 'font-semibold text-primary' : ''}>2. Platform</span>
            <ArrowRight className="h-3 w-3" />
            <span className={step >= 3 ? 'font-semibold text-primary' : ''}>3. Review</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-12">
        {step === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Tell us about your business</CardTitle>
              <CardDescription>This information helps BAS understand and represent your business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Want to explore BAS with demo data?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Creates 3 demo businesses (clothing store, salon, hotel) with products, services, FAQs, and workflows.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSeedDemo} disabled={seeding}>
                    {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Load Demo
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input id="name" placeholder="e.g. Beauty Salon Kigali" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Business Type</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {BUSINESS_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setBusinessType(t.value)}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all ${
                        businessType === t.value ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <t.icon className={`h-6 w-6 ${businessType === t.value ? 'text-primary' : 'text-slate-500'}`} />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Rwanda" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Kigali" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input id="email" type="email" placeholder="info@business.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+250 700 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="USD">USD ($)</option>
                  <option value="RWF">RWF (Rwandan Franc)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="NGN">NGN (Nigerian Naira)</option>
                  <option value="GHS">GHS (Ghanaian Cedi)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Briefly describe what your business does..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} disabled={!businessName}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">How does your business operate?</CardTitle>
              <CardDescription>Select the platforms you currently use. You can skip this if you don&apos;t have any.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PLATFORM_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => togglePlatform(p.value)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                      platforms.includes(p.value) ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                      platforms.includes(p.value) ? 'border-primary bg-primary' : 'border-slate-300'
                    }`}>
                      {platforms.includes(p.value) && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium">{p.label}</span>
                  </button>
                ))}
              </div>

              {platforms.includes('website') && (
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example-business.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">BAS will import public content from this URL as business knowledge.</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Review and create</CardTitle>
              <CardDescription>Confirm your business details below. You can change everything later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="font-medium">{businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="font-medium">{BUSINESS_TYPES.find((t) => t.value === businessType)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="font-medium">{city || '—'}, {country || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium">{email || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="font-medium">{phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Currency</span>
                  <span className="font-medium">{currency}</span>
                </div>
                {websiteUrl && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Website</span>
                    <span className="font-medium truncate max-w-[200px]">{websiteUrl}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Platforms</span>
                  <span className="font-medium">{platforms.length > 0 ? platforms.join(', ') : 'None'}</span>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-slate-700">
                  After creating your business, you&apos;ll be able to add products, services, FAQs, policies,
                  and connect more integrations from the dashboard.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleCreateBusiness} disabled={loading || !businessName}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Business <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
