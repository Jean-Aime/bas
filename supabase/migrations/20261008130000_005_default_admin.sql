/*
# BAS — Default platform admin (migration 005)

## What this does
Seeds a default admin account that can sign in to the BAS admin panel
at /admin:

    email:    admin@bas.local
    password: Admin123!

The admin panel gate (components/admin/admin-layout.tsx) allows a user
when they own a `memberships` row with role = 'platform_admin'. This
migration creates:

  1. an account in auth.users          (the credential)
  2. an auth.identities row            (email provider sign-in)
  3. a placeholder "BAS Platform" business (memberships.business_id is NOT NULL)
  4. a memberships row with role = 'platform_admin'  (the gate)

## Why the role lives in `memberships`, not a `users` table
There is no public `users` table in this schema — accounts live in
Supabase's `auth.users` (owned by GoTrue), and application roles are
stored in `memberships.role` (plain `text`, no CHECK constraint), so
`platform_admin` is a legal value with no ALTER TABLE required.

## Idempotency
Every statement is guarded (WHERE NOT EXISTS / ON CONFLICT DO UPDATE),
so re-running the migration is safe: it never duplicates rows and it
repairs a missing/incorrect membership for the admin account.

## Promoting an EXISTING account instead
If you already signed up and want YOUR account to be the admin:

  UPDATE memberships
  SET role = 'platform_admin'
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'you@example.com')
    AND business_id = (SELECT id FROM businesses WHERE name = 'BAS Platform');

## SECURITY NOTE
These are DEFAULT credentials intended to be changed after first login.
Rotate the password (auth → user → update password) before exposing any
environment to the internet.
*/

-- crypt()/gen_salt() live in pgcrypto (installed in the `extensions`
-- schema on hosted Supabase). IF NOT EXISTS is a no-op when present.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- 1. The credential: auth.users account (email already confirmed)
-- ─────────────────────────────────────────────────────────────

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated',
  'authenticated',
  'admin@bas.local',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Platform Admin","role":"platform_admin"}'::jsonb,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'admin@bas.local'
);

-- ─────────────────────────────────────────────────────────────
-- 2. Email provider identity (required by modern GoTrue sign-in)
-- ─────────────────────────────────────────────────────────────

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'full_name', 'Platform Admin'
  ),
  'email',
  u.id::text,
  now(), now(), now()
FROM auth.users u
WHERE lower(u.email) = 'admin@bas.local'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = u.id AND i.provider = 'email'
  );

-- ─────────────────────────────────────────────────────────────
-- 3. Placeholder business (memberships.business_id is NOT NULL)
-- ─────────────────────────────────────────────────────────────

INSERT INTO businesses (
  id, name, type, country, city, email, description,
  currency, status, created_at, updated_at
)
SELECT
  '22222222-2222-4222-8222-222222222222',
  'BAS Platform',
  'platform',
  NULL,
  NULL,
  'admin@bas.local',
  'Internal platform administration tenant. Holds the platform_admin membership.',
  'USD',
  'active',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM businesses
  WHERE id = '22222222-2222-4222-8222-222222222222'
     OR name = 'BAS Platform'
);

-- ─────────────────────────────────────────────────────────────
-- 4. The gate: platform_admin membership
--    ON CONFLICT repairs a stale role if re-run.
-- ─────────────────────────────────────────────────────────────

INSERT INTO memberships (id, user_id, business_id, role, created_at)
SELECT
  '33333333-3333-4333-8333-333333333333',
  u.id,
  '22222222-2222-4222-8222-222222222222',
  'platform_admin',
  now()
FROM auth.users u
WHERE lower(u.email) = 'admin@bas.local'
ON CONFLICT (user_id, business_id)
DO UPDATE SET role = 'platform_admin';
