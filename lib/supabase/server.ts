import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

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

export function createServerSupabase() {
  const session = getSessionFromCookies();

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: session ? { headers: { Authorization: `Bearer ${session.access_token}` } } : undefined,
  });
}