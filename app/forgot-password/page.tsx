'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailCheck, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      title={sent ? 'Check your inbox' : 'Forgot password'}
      subtitle={
        sent
          ? 'A reset link is on its way.'
          : "Enter your account email and we'll send you a reset link."
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-2/50 py-8 text-center animate-fade-in">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <MailCheck className="h-6 w-6 text-success" />
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">
            If an account exists for{' '}
            <span className="font-medium text-foreground">{email}</span>, a reset
            link is on its way.
          </p>
          <Link
            href="/login"
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                placeholder="you@business.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send reset link
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
