import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { createDemoSupabaseClient } from '@/lib/demo/demo-client';

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === '1';

/**
 * Server-side Supabase client. In demo mode returns the in-memory fake so API
 * routes (chat, workflows, seed) run offline against the seeded dataset.
 */
export function createServerSupabase() {
  if (isDemoMode) return createDemoSupabaseClient() as unknown as ReturnType<typeof createClient>;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  // Prefer the service-role key when available; otherwise fall back to the anon
  // key so the prototype runs end-to-end with only public credentials. Requests
  // additionally carry the visitor's session cookie when present, so logged-in
  // users act with their own role instead of always the anon role.
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  /**
   * Extract the Supabase auth session from the request cookies, if any.
   * Anonymous visitors (no cookie) return null and requests run as the anon role.
   */
  /**
   * Extract a Supabase access token from the request's Authorization header.
   * The app persists the session in localStorage (not cookies), so API routes
   * must forward the browser's bearer token to act as the signed-in user —
   * otherwise everything runs as anon and RLS rejects the writes.
   */
  function getSessionFromAuthorizationHeader(): { access_token: string; refresh_token: string } | null {
    try {
      const auth = headers().get('authorization');
      if (!auth) return null;
      const m = auth.match(/^Bearer\s+(.+)$/i);
      if (!m) return null;
      const token = m[1].trim();
      // Refresh tokens are meaningless here but the shape is reused; leave empty.
      return { access_token: token, refresh_token: '' };
    } catch {
      return null;
    }
  }

  function getSessionFromCookies(): { access_token: string; refresh_token: string } | null {
    try {
      const cookieHeader = headers().get('cookie');
      if (!cookieHeader) return null;

      const authCookie = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => {
          const [name] = part.split('=');
          return /^sb-.*-auth-token$/.test(name || '');
        });

      if (!authCookie) return null;

      const value = authCookie.slice(authCookie.indexOf('=') + 1);
      const parsed = JSON.parse(decodeURIComponent(value));
      if (!parsed?.access_token) return null;

      return { access_token: parsed.access_token, refresh_token: parsed.refresh_token || '' };
    } catch {
      return null;
    }
  }

  const session =
    getSessionFromAuthorizationHeader() ?? getSessionFromCookies();

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: session ? { headers: { Authorization: `Bearer ${session.access_token}` } } : undefined,
  });
}
