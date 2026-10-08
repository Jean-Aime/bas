import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

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

export function createServerSupabase(userToken?: string) {
  // Explicit user context: run as THAT user with the anon key so Postgres
  // role = authenticated and row-level security decides what is allowed.
  if (userToken) {
    return createClient(supabaseUrl, anonKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: { headers: { Authorization: `Bearer ${userToken}` } },
    });
  }

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

function anonKey(): string {
  return process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

/**
 * Service-role client — bypasses RLS. Only for operations that RLS
 * legitimately blocks for a user (e.g. adding ANOTHER user to a team)
 * AFTER the caller's role has been verified with a user-scoped client.
 */
export function createAdminSupabase() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Raw Supabase access token from `Authorization: Bearer …`, or ''.
 */
export function getBearerToken(req: NextRequest): string {
  const header = req.headers.get('authorization') || '';
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
}

/**
 * Verify the caller: reads `Authorization: Bearer <supabase access token>`
 * and validates it against Supabase Auth. Returns the authenticated user id,
 * or null when the token is missing/invalid — routes must then respond 401.
 */
export async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const { data, error } = await createServerSupabase(token).auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/**
 * Role gate for tenant operations: checks that the authenticated user holds
 * one of `roles` in `businessId`. Backed by RLS (users can read their own
 * memberships), so this cannot be spoofed by the request body.
 */
export async function callerRoleInBusiness(
  userToken: string,
  userId: string,
  businessId: string,
  roles?: string[],
): Promise<string | null> {
  const supabase = createServerSupabase(userToken);
  const { data } = await supabase
    .from('memberships')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .maybeSingle();

  const role = data?.role ?? null;
  if (!role) return null;
  if (roles && !roles.includes(role)) return null;
  return role;
}