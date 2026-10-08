'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Lock, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Password updated. Please sign in.');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center  px-5 py-12">
      <div className="w-full max-w-sm animate-in-up">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-fill shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold">BAS</span>
        </Link>

        <div className="surface-raised rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-heading text-foreground mb-1.5">Reset your password</h1>
            <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
          </div>

          {checking ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : hasSession ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">New password</Label>
                <div className="relative input-glow rounded-lg">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-[hsl(var(--surface-1))] border-border/80"
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
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Confirm password</Label>
                <div className="relative input-glow rounded-lg">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="password"
                    required
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-10 h-11 bg-[hsl(var(--surface-1))] border-border/80"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 brand-fill border-0 shadow-sm hover:opacity-90 transition-all font-semibold"
                disabled={loading || !password || !confirm}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Update password
              </Button>
            </form>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                This page must be opened from the password reset email link. Request a new link if yours expired.
              </p>
              <Button variant="outline" onClick={() => router.push('/forgot-password')} className="w-full">
                Request a new link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
