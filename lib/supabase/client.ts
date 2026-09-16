import { createClient } from '@supabase/supabase-js';
import { createDemoSupabaseClient } from '@/lib/demo/demo-client';
import { isDemoModeActive } from '@/lib/demo/demo-mode';

function createRealSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Browser Supabase client. When demo mode is active (env flag or runtime
 * override) returns an in-memory fake so the whole app runs offline against
 * the seeded dataset (see lib/demo/README.md).
 */
export function createSupabaseClient() {
  if (isDemoModeActive()) {
    return createDemoSupabaseClient() as unknown as ReturnType<typeof createRealSupabaseClient>;
  }
  return createRealSupabaseClient();
}

export const supabase = createSupabaseClient();
