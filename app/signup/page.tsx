'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PERKS = [
  'Free forever on the starter plan',
  'No credit card required',
  'Multi-business support included',
  'AI assistant ready in minutes',
];

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push('/onboarding');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (data.user) {
        toast.success("Account created! Let's set up your business.");
        router.push('/onboarding');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ['', 'bg-destructive', 'bg-warning', 'bg-success'];
  const pwLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="flex min-h-screen ">
      {/* Left branding panel */}
      <div className="relative hidden lg:flex lg:w-[46%] xl:w-[52%] flex-col justify-between overflow-hidden p-12" style={{ background: 'hsl(var(--sidebar-bg))' }}>

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BAS</span>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Get started today</p>
            <h2 className="font-display text-5xl font-bold leading-[1.08] text-white">
              Set up in minutes,<br /><span className="text-voice" style={{ color: 'hsl(var(--sidebar-active))' }}>not months.</span>
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-white/60">
              Create your account, add your business, and your AI assistant is live.
            </p>
          </div>
          <div className="space-y-3">
            {PERKS.map((t) => (
              <div key={t} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'hsl(var(--sidebar-active))' }} />
                <span className="text-sm font-medium text-white/75">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-xs text-white/40">© 2025 BAS. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-10">
        <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-fill shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold">BAS</span>
        </Link>

        <div className="w-full max-w-sm animate-in-up">
          <div className="mb-8">
            <span className="text-label text-primary">Open your account</span>
            <h1 className="text-heading mt-2.5 text-foreground">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Start automating your business today — free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <div className="relative input-glow rounded-lg">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-11 bg-card border-border/80 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative input-glow rounded-lg">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-card border-border/80 focus:border-primary/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative input-glow rounded-lg">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-card border-border/80 focus:border-primary/50 transition-colors"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= pwStrength ? pwColors[pwStrength] : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{pwLabels[pwStrength]}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full font-semibold transition-opacity hover:opacity-90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
