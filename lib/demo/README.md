# Demo Mode

Demo mode runs the entire app offline against a seeded, in-memory dataset — no Supabase project, network, or credentials needed. It exists so the dashboard, charts, workflow visualizer, and customer chat can be demoed (e.g. on a plane, in a sales call, or while the database is down).

## Enable / disable

```bash
# .env
NEXT_PUBLIC_DEMO_MODE=true    # demo dataset (default false)
```

Restart `npm run dev` after changing the flag — it is read at build/module-init time.

## What you get

- **3 businesses** (clothing store, salon, hotel) with products/services, FAQs, policies, locations, and business hours — the same fixtures as the onboarding seeder.
- **6 weeks of CRM activity**: 13 conversations with realistic message threads, 6 orders, 6 bookings, 6 requests, and ~1,600 background messages so the volume and trend charts have shape (weekday-heavy, gently rising).
- **8 workflows** (from the standard template set plus a salon appointment flow) with 12 executions — completed, failed, and running — plus step logs, so the workflow visualizer has replays to animate.
- **Notifications** (unread and read) across all three notification types, plus audit-log entries.

All timestamps are generated relative to *now*, so "last 7 days" charts always look populated no matter when the demo runs. The RNG is seeded (mulberry32), so the dataset is identical between resets.

## Architecture

| File | Purpose |
| --- | --- |
| `lib/demo/demo-data.ts` | `buildDemoDataset()` — builds the seeded snapshot from static fixtures + a deterministic RNG. |
| `lib/demo/demo-client.ts` | `createDemoSupabaseClient()` — in-memory fake of supabase-js covering the exact builder surface the app uses (`select/eq/ilike/or/order/limit`, `insert/update/delete`, `single/maybeSingle`, `channel()`, `auth.*`, `auth.admin.listUsers`). |
| `lib/supabase/client.ts` / `server.ts` | Return the demo client instead of supabase-js when the flag is on. |
| `components/demo/demo-banner.tsx` | Floating "Demo data" badge with an explainer and a **Reset demo data** action. |

## Behavior details

- **Writes work** but are in-memory only: marking notifications read, resolving requests, toggling workflows, and sending chat messages mutate the store for the session (even across client-side navigation). Reload rebuilds the seed; the banner's reset button does it explicitly.
- **Auth is faked**: a `demo@bas.app` owner session owns all three businesses. `/login`, `/signup`, and password flows sign into the same demo identity.
- **Realtime is a no-op**: channels report `SUBSCRIBED` immediately; the app's polling keeps the notification bell fresh.
- **Unsupported calls fail loudly**: `rpc()` and unknown tables return PostgREST-style errors so gaps are visible rather than silent.
- **Chat works end-to-end**: `/api/chat` runs against the demo store, so the intent detection → workflow execution → order/booking record pipeline is fully demoable.
