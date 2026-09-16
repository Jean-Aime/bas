# Supabase Setup Guide — BAS

Complete setup for a **fresh** Supabase project: consolidated SQL script (schema + RLS + realtime), then the exact dashboard clicks.

Project used in examples: `vdbuzudmkxisqqjdicnu` — replace with your own project ref/URL/keys where they differ.

---

## 0. Prerequisites

- A Supabase account and a new project (any region; pick one close to your users).
- Node 18+ and the Supabase CLI if you prefer terminal over dashboard:

```bash
npm i -g supabase
supabase login
supabase init          # if supabase/ doesn't exist yet (it does in this repo)
supabase link --project-ref vdbuzudmkxisqqjdicnu
```

---

## 1. Environment variables

Create `.env` in the project root (see `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vdbuzudmkxisqqjdicnu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   # optional; server-side only
NEXT_PUBLIC_DEMO_MODE=false               # set true for offline demo mode
```

Notes:
- The app accepts both new-style keys (`sb_publishable_...` / `sb_secret_...`) and legacy JWT keys (`anon` / `service_role`).
- `SUPABASE_SERVICE_ROLE_KEY` is optional for development. Without it the server routes act as the visitor (anon or logged-in) and RLS applies. For production we recommend setting it and **never** exposing it to the client (it is only read by `lib/supabase/server.ts`).
- `.env` is gitignored — never commit real keys.

---

## 2. Run the consolidated setup script

One script does everything: tables, RLS, indexes, and realtime publication.

**Dashboard (recommended for a fresh project):**
1. Open https://supabase.com/dashboard/project/vdbuzudmkxisqqjdicnu/sql/new
2. Click **New query**.
3. Paste the entire contents of `supabase/setup.sql`.
4. Click **Run** (or `Ctrl/Cmd+Enter`).
5. Expect "Success. No rows returned" and zero errors.

**CLI:**

```bash
supabase db execute --file supabase/setup.sql
```

> The older split migrations in `supabase/migrations/` are unchanged and still work for CLI migration workflows (`supabase db push`). The consolidated `setup.sql` is a convenience for fresh projects and the SQL editor.

What it creates, in order:
1. **Schema** — 25 tables: tenancy (`businesses`, `memberships`), business config (profiles, hours, locations, policies, rules), catalog (products/services + categories), knowledge (`knowledge_sources`/`knowledge_documents`), customers, conversations/messages, automation (`workflows`, `workflow_executions`, `workflow_execution_logs`), operations (`orders`, `bookings`, `requests`), `notifications`, `audit_logs`.
2. **Helper** — `is_business_member(business_id)` SECURITY DEFINER function used by every tenant policy.
3. **RLS enabled on all 25 tables.**
4. **Policies** — member-scoped CRUD via `is_business_member()`, owner-scoped `memberships`/`notifications`, and minimal anon policies for the public web chat (conversations, messages, customers, orders, bookings, requests, workflow executions/logs, and public catalog reads).
5. **Indexes** — on every `business_id` / `user_id` / FK used by the dashboard queries.
6. **Realtime** — adds `notifications`, `conversations`, `messages`, `orders`, `bookings`, `requests`, `workflow_executions`, `workflow_execution_logs` to the `supabase_realtime` publication (idempotent).

---

## 3. Dashboard clicks after the SQL

These settings are **not** settable via SQL, so do them in the dashboard.

### 3.1 Realtime (required for live notifications)

The SQL already added the tables to the `supabase_realtime` publication. Optionally verify:
1. Dashboard → **Database → Replication** (`/database/replication`).
2. Under **supabase_realtime** you should see the 8 tables from Section 8 toggled on. If any are off, flip them on.

No UI clicks are strictly required if Section 8 ran successfully.

### 3.2 Authentication

1. Dashboard → **Authentication → Providers** (`/auth/providers`): **Email** provider is on by default — leave it enabled.
2. Dashboard → **Authentication → Sign In / Up** (`/auth/auth-page` or `/auth/templates` depending on dashboard version):
   - For local dev you can turn **Confirm email** off so signups go straight to onboarding without a verification email. For production, leave it **on**.
3. Dashboard → **Authentication → URL Configuration** (`/auth/url-configuration`):
   - **Site URL**: your local dev URL, e.g. `http://localhost:3000` (change to your production URL when you deploy).
   - **Redirect URLs**: add
     - `http://localhost:3000/**`
     - your production domain with `/**` (e.g. `https://your-app.netlify.app/**`)

### 3.3 API keys (new key format)

1. Dashboard → **Project Settings → API** (`/project/_/settings/api`).
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Secret keys** section → **Create secret key** → copy `sb_secret_...` → `SUPABASE_SERVICE_ROLE_KEY` (optional, server-only).

### 3.4 Optional hardening

- **Database → Backups** — verify daily backups are enabled (paid plans).
- **Database → Lints** (advisors) — run the security linter; it should report no RLS `ERROR`s (the two `NOTICE`-level performance hints about `auth.uid()` in policies are expected and safe).
- **Settings → General** — pause/delete unused projects.

---

## 4. Verify everything works

1. `npm run dev` → open `http://localhost:3000`.
2. **Signup** at `/signup` → you should land on `/onboarding` and create your first business.
3. **Dashboard** loads with KPIs at zero — that's correct for a fresh project.
4. **Realtime**: open the dashboard in one window and `/chat` in another; send a chat message that triggers a workflow (e.g. "I'd like to order something"). The notification bell should update without a refresh.
5. **Offline demo mode** (optional): set `NEXT_PUBLIC_DEMO_MODE=true` in `.env`, restart `npm run dev` — the dashboard fills with seeded demo data and a "Demo mode" banner appears. No Supabase calls are made; see `lib/demo/README.md`.

---

## 5. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `relation "businesses" does not exist` | The setup script didn't run or ran on another project — re-check the project ref in the URL and re-run `setup.sql`. |
| `permission denied for schema public` or `must be owner of publication supabase_realtime` | You're running SQL as a non-owner role. Run Section 8 (and ideally the whole script) via the dashboard SQL editor or `supabase db execute`, which uses the `postgres` role. |
| `permission denied` on a table at runtime | RLS is on but no policy matched. Ensure you're logged in, created the business (membership exists), or hit an anon-allowed table from the chat. |
| Realtime events not arriving | Check **Database → Replication** shows the table in `supabase_realtime`, confirm the client filter matches (`business_id`, `user_id`), and that RLS SELECT policy passes for the subscribing user. |
| Signup email never arrives | Dev shortcut: disable **Confirm email** under Authentication providers. Production: configure SMTP under Project Settings → Auth. |
| Wrong business shown after login | The selected business is stored in `localStorage` (`bas_current_business_id`); clear it or use the business switcher. |
