'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Mail, MailCheck, Loader2, ArrowLeft } from 'lucide-react';
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
    if (error) { toast.error(error.message); return; }
    setSent(true);
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
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                <MailCheck className="h-7 w-7 text-success" />
              </div>
              <div className="space-y-1">
                <h1 className="text-base font-semibold text-foreground">Check your inbox</h1>
                <p className="text-sm text-muted-foreground">
                  If an account exists for <span className="font-medium text-foreground">{email}</span>, a reset link is on its way.
                </p>
              </div>
              <Link href="/login" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 mt-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-heading text-foreground mb-1.5">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="relative input-glow rounded-lg">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      required
                      placeholder="you@business.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-[hsl(var(--surface-1))] border-border/80"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 brand-fill border-0 shadow-sm hover:opacity-90 transition-all font-semibold"
                  disabled={loading || !email.trim()}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send reset link
                </Button>
              </form>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                Remembered it?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
