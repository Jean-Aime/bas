/**
 * Demo mode flag resolution.
 *
 * The effective mode is: localStorage override ?? NEXT_PUBLIC_DEMO_MODE env
 * default. The override lets users flip demo mode at runtime from the UI
 * (dashboard topbar / admin panel) without editing .env — switching takes
 * effect on the next page load, when the Supabase clients are re-created.
 *
 * Server-side there is no localStorage, so the env default always wins there;
 * client components should read the flag after mount to avoid hydration
 * mismatches (see components/demo/demo-banner.tsx).
 */

export const DEMO_ENV_DEFAULT =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === '1';

export const DEMO_OVERRIDE_KEY = 'bas_demo_mode_override';

/** Runtime override from localStorage, or null when unset. */
export function getDemoModeOverride(): boolean | null {
  try {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(DEMO_OVERRIDE_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

/** Persist the override; null clears it (falling back to the env default). */
export function setDemoModeOverride(value: boolean | null): void {
  try {
    if (value === null) window.localStorage.removeItem(DEMO_OVERRIDE_KEY);
    else window.localStorage.setItem(DEMO_OVERRIDE_KEY, value ? 'true' : 'false');
  } catch {
    // storage unavailable — override silently unsupported
  }
}

/** Effective demo mode: runtime override wins over the env default. */
export function isDemoModeActive(): boolean {
  return getDemoModeOverride() ?? DEMO_ENV_DEFAULT;
}
