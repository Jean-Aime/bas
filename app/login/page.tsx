'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back!');
      router.push('/onboarding');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="relative space-y-6">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Business Automation System</p>
            <h2 className="font-display text-5xl font-bold leading-[1.08] text-white">
              Your AI assistant<br />
              <span className="text-voice" style={{ color: 'hsl(var(--sidebar-active))' }}>never sleeps.</span>
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-white/60">
              Handle customer conversations, orders, and bookings automatically — 24/7.
            </p>
          </div>
          <div className="space-y-3">
            {['Intent-aware AI responses', 'Automated order & booking capture', 'Human handover when it matters'].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <span className="text-sm text-white/80 font-medium">{t}</span>
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
            <span className="text-label text-primary">Welcome back</span>
            <h1 className="text-heading mt-2.5 text-foreground">Sign in to BAS</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Your front desk is standing by.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative input-glow rounded-lg">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-card border-border/80 focus:border-primary/50 transition-colors"
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
            </div>

            <Button
              type="submit"
              className="h-11 w-full font-semibold transition-opacity hover:opacity-90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
