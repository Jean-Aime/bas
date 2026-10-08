/*
 * Local, real-Postgres verification of the BAS database layer.
 *
 * What it proves (against actual PostgreSQL, not a mock):
 *   1. migrations 001-005 all apply cleanly, in order
 *   2. the default admin from migration 005 exists and its bcrypt
 *      password actually verifies
 *   3. the /admin gate query passes for the admin and fails for others
 *   4. RLS: anon is locked out of tenant data, sees only the public catalog
 *   5. RLS: tenant isolation between two different businesses
 *   6. RLS: membership self-elevation is blocked (migration 004)
 *   7. service-role bypasses RLS (the /api/team roster pattern)
 *   8. RLS is enabled on every public table
 *   9. migration 005 is idempotent (safe to re-run)
 *
 * The Supabase environment is emulated faithfully:
 *   - roles anon / authenticated / service_role (BYPASSRLS)
 *   - auth schema with users/identities + auth.uid()
 *   - pgcrypto in the `extensions` schema
 *   - Supabase default grants (ALL on public tables to the three roles)
 *     — hosted Supabase applies these automatically; WITHOUT them the RLS
 *       tests would be meaningless (permission-denied instead of filtering)
 *
 * Run:  node scripts/pg-verify/verify.mjs
 * Exit code 0 = every check passed.
 */

import EmbeddedPostgres from 'embedded-postgres';
import pgpkg from 'pg';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { Client } = pgpkg;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.resolve(HERE, '../../supabase/migrations');
const DATA_DIR = path.join(HERE, 'data');
const PORT = Number(process.env.PG_PORT || 55433);
const DB = 'bas_verify';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const PLATFORM_BIZ = '22222222-2222-4222-8222-222222222222';
const STAFF_ID = '44444444-4444-4444-8444-444444444444';
const TENANT_USER = '55555555-5555-4555-8555-555555555555';
const NEWBIE_ID = '66666666-6666-4666-8666-666666666666';
const ELEVATE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TENANT_BIZ = '77777777-7777-4777-8777-777777777777';
const EMPTY_BIZ = '88888888-8888-4888-8888-888888888888';
const DRAFT_BIZ = '99999999-9999-4999-8999-999999999997';

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

let client;
let epRef = null;
const q = (sql) => client.query(sql);
const one = async (sql) => (await q(sql)).rows[0];

async function be(role, sub) {
  await q('RESET ROLE');
  await q(`SET request.jwt.claim.sub = '${sub || ''}'`);
  await q(`SET request.jwt.claim.role = '${role}'`);
  await q(`SET ROLE ${role}`);
}

async function main() {
  rmSync(DATA_DIR, { recursive: true, force: true });

  const ep = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: 'postgres',
    password: 'postgres',
    port: PORT,
    persistent: false,
    // Hosted Supabase clusters are UTF-8; the Windows default locale
    // (WIN1252) cannot store UTF-8 box-drawing chars used in migration
    // comments and would fail spuriously.
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
  });

  console.log('Starting embedded PostgreSQL…');
  epRef = ep;
  await ep.initialise();
  await ep.start();

  try {
    const boot = new Client({ host: '127.0.0.1', port: PORT, user: 'postgres', password: 'postgres', database: 'postgres' });
    await boot.connect();
    await boot.query(`DROP DATABASE IF EXISTS ${DB}`);
    await boot.query(`CREATE DATABASE ${DB}`);
    await boot.end();

    client = new Client({ host: '127.0.0.1', port: PORT, user: 'postgres', password: 'postgres', database: DB });
    client.on('error', (e) => {
      console.error('DB connection lost:', e.message);
      Promise.resolve(epRef?.stop()).catch(() => {}).finally(() => process.exit(3));
    });
    await client.connect();
    await q(`SET search_path = '$user', public, extensions`);

    // ── Supabase environment emulation ────────────────────────────
    await q(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
      END $$;
      CREATE SCHEMA IF NOT EXISTS extensions;
      CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
      CREATE SCHEMA IF NOT EXISTS auth;
      CREATE TABLE IF NOT EXISTS auth.users (
        instance_id uuid,
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        aud varchar(255),
        role varchar(255),
        email varchar(255) DEFAULT '',
        encrypted_password varchar(255) DEFAULT '',
        email_confirmed_at timestamptz,
        invited_at timestamptz,
        confirmation_token varchar(255) DEFAULT '',
        confirmation_sent_at timestamptz,
        recovery_token varchar(255) DEFAULT '',
        recovery_sent_at timestamptz,
        email_change_token_new varchar(255) DEFAULT '',
        email_change varchar(255) DEFAULT '',
        email_change_sent_at timestamptz,
        last_sign_in_at timestamptz,
        raw_app_meta_data jsonb,
        raw_user_meta_data jsonb,
        is_super_admin boolean,
        created_at timestamptz,
        updated_at timestamptz,
        phone text DEFAULT NULL,
        phone_confirmed_at timestamptz,
        phone_change text DEFAULT '',
        phone_change_token varchar(255) DEFAULT '',
        phone_change_sent_at timestamptz,
        email_change_token_current varchar(255) DEFAULT '',
        email_change_confirm_status smallint DEFAULT 0,
        banned_until timestamptz,
        reauthentication_token varchar(255) DEFAULT '',
        reauthentication_sent_at timestamptz,
        is_sso_user boolean NOT NULL DEFAULT false,
        deleted_at timestamptz,
        is_anonymous boolean NOT NULL DEFAULT false
      );
      CREATE TABLE IF NOT EXISTS auth.identities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id text NOT NULL,
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        identity_data jsonb NOT NULL,
        provider text NOT NULL,
        last_sign_in_at timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
        LANGUAGE sql STABLE AS $fn$
          SELECT nullif(
            coalesce(
              current_setting('request.jwt.claim.sub', true),
              (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
            ), ''
          )::uuid
        $fn$;
      GRANT USAGE ON SCHEMA auth, extensions TO anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION auth.uid() TO PUBLIC;
      GRANT SELECT ON auth.users, auth.identities TO service_role;
    `);

    // ── Supabase default privileges — BEFORE migrations, exactly like
    // hosted Supabase (grants land at table creation; migration 004 then
    // REVOKEs membership mutation from clients, which a blanket
    // post-migration GRANT would silently undo). ──────────────────
    await q(`
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
    `);

    // ── 1. Apply every migration in order ─────────────────────────
    const files = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort();
    let allApplied = true;
    for (const f of files) {
      const sql = readFileSync(path.join(MIG_DIR, f), 'utf8');
      try {
        await q(sql);
        console.log(`applied  ${f}`);
      } catch (e) {
        allApplied = false;
        check(`migration applies: ${f}`, false, e.message);
        throw e;
      }
    }
    check('all 5 migrations apply cleanly in order', allApplied && files.length === 5, `${files.length} files`);

    // ── Supabase default grants (hosted does this automatically) ──
    await q(`
      GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
    `);

    // ── Fixtures (as superuser, like service-role would) ──────────
    await q(`
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, created_at, updated_at)
      VALUES
        ('${STAFF_ID}', 'staff@bas.local', crypt('Staff123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email"}', now(), now()),
        ('${TENANT_USER}', 'tenant@bas.local', crypt('Tenant123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email"}', now(), now()),
        ('${NEWBIE_ID}', 'newbie@bas.local', crypt('Newbie123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email"}', now(), now()),
        ('${ELEVATE_ID}', 'elevate@bas.local', crypt('Elevate123!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email"}', now(), now());
      INSERT INTO memberships (user_id, business_id, role) VALUES ('${STAFF_ID}', '${PLATFORM_BIZ}', 'staff');
      INSERT INTO businesses (id, name, type, status) VALUES
        ('${TENANT_BIZ}', 'Other Tenant Shop', 'salon', 'active'),
        ('${EMPTY_BIZ}', 'Empty Business', 'general', 'active'),
        ('${DRAFT_BIZ}', 'Hidden Draft Business', 'general', 'draft');
      INSERT INTO memberships (user_id, business_id, role) VALUES ('${TENANT_USER}', '${TENANT_BIZ}', 'business_owner');
      INSERT INTO conversations (id, business_id, channel) VALUES
        ('99999999-9999-4999-8999-999999999999', '${TENANT_BIZ}', 'web_chat'),
        ('99999999-9999-4999-8999-999999999998', '${PLATFORM_BIZ}', 'web_chat');
      INSERT INTO messages (conversation_id, business_id, content) VALUES
        ('99999999-9999-4999-8999-999999999999', '${TENANT_BIZ}', 'hello from tenant B'),
        ('99999999-9999-4999-8999-999999999998', '${PLATFORM_BIZ}', 'hello from platform');
      INSERT INTO products (business_id, name, price, is_active) VALUES ('${PLATFORM_BIZ}', 'Fixture Product', 100, true);
      INSERT INTO faqs (business_id, question, answer, is_published) VALUES ('${PLATFORM_BIZ}', 'Q?', 'A.', true);
    `);

    // ── 2. Default admin from migration 005 ───────────────────────
    const admin = await one(`SELECT id, encrypted_password FROM auth.users WHERE email = 'admin@bas.local'`);
    check('005 seeds auth.users admin@bas.local', !!admin && admin.id === ADMIN_ID);

    const pwOk = admin && (await one(`SELECT crypt('Admin123!', '${admin.encrypted_password}') = '${admin.encrypted_password}' AS ok`)).ok;
    check('admin password Admin123! verifies (bcrypt)', pwOk === true);

    const ident = await one(`SELECT count(*)::int AS n FROM auth.identities i JOIN auth.users u ON u.id = i.user_id WHERE u.email = 'admin@bas.local' AND i.provider = 'email'`);
    check('005 seeds email identity for GoTrue sign-in', ident.n === 1, `count=${ident.n}`);

    // ── 3. Admin gate (exactly what admin-layout.tsx runs) ────────
    await be('authenticated', ADMIN_ID);
    const gateAdmin = await one(`SELECT count(*)::int AS n FROM memberships WHERE user_id = '${ADMIN_ID}' AND role = 'platform_admin'`);
    check('admin gate passes for seeded admin', gateAdmin.n === 1, `rows=${gateAdmin.n}`);

    await be('authenticated', STAFF_ID);
    const gateStaff = await one(`SELECT count(*)::int AS n FROM memberships WHERE user_id = '${STAFF_ID}' AND role = 'platform_admin'`);
    check('admin gate DENIED for staff user', gateStaff.n === 0, `rows=${gateStaff.n}`);

    // ── 4. anon locked out of tenant data (migration 004) ─────────
    await be('anon', null);
    const anonCounts = {};
    for (const t of ['conversations', 'messages', 'customers', 'orders', 'bookings', 'requests', 'knowledge_sources', 'knowledge_documents', 'workflow_executions']) {
      anonCounts[t] = (await one(`SELECT count(*)::int AS n FROM ${t}`)).n;
    }
    const anonLocked = Object.values(anonCounts).every((n) => n === 0);
    check('anon sees ZERO rows in all tenant tables', anonLocked, JSON.stringify(anonCounts));

    let anonInsertBlocked = false;
    try {
      await q(`INSERT INTO conversations (business_id) VALUES ('${PLATFORM_BIZ}')`);
    } catch (e) {
      anonInsertBlocked = /row-level security|violates/.test(e.message);
    }
    check('anon INSERT into tenant data blocked by RLS', anonInsertBlocked);

    // ── 5. anon public catalog still readable (by design) ─────────
    const catBiz = await one(`SELECT count(*)::int AS n FROM businesses WHERE status = 'active'`);
    const catProd = await one(`SELECT count(*)::int AS n FROM products WHERE is_active = true`);
    const catFaq = await one(`SELECT count(*)::int AS n FROM faqs WHERE is_published = true`);
    check('anon reads public catalog (businesses/products/faqs)', catBiz.n >= 1 && catProd.n >= 1 && catFaq.n >= 1,
      `biz=${catBiz.n} prod=${catProd.n} faq=${catFaq.n}`);

    // ── 6. Tenant isolation between businesses ────────────────────
    await be('authenticated', STAFF_ID); // member of PLATFORM_BIZ only
    const staffConv = await one(`SELECT count(*)::int AS n FROM conversations`);
    const staffMsg = await one(`SELECT count(*)::int AS n FROM messages`);
    check("platform member sees only their own tenant's chats (1 of 2)", staffConv.n === 1 && staffMsg.n === 1,
      `conv=${staffConv.n} msg=${staffMsg.n}`);

    await be('authenticated', TENANT_USER); // member of TENANT_BIZ
    const ownerConv = await one(`SELECT count(*)::int AS n FROM conversations`);
    const ownerDraft = await one(`SELECT count(*)::int AS n FROM businesses WHERE id = '${DRAFT_BIZ}'`);
    check("tenant member sees only their own tenant's chats (1 of 2)", ownerConv.n === 1, `conv=${ownerConv.n}`);
    check('inactive (draft) business invisible to non-members', ownerDraft.n === 0, `rows=${ownerDraft.n}`);
    // Active businesses ARE intentionally public (public chat directory —
    // see migration 004 comment "public catalog kept by design").
    const ownerDir = await one(`SELECT count(*)::int AS n FROM businesses WHERE id = '${PLATFORM_BIZ}'`);
    check('active business stays in the PUBLIC directory (by design)', ownerDir.n === 1, `rows=${ownerDir.n}`);

    // ── 7. Membership self-elevation blocked (004) ────────────────
    await be('authenticated', NEWBIE_ID); // no memberships at all
    let claimOk = false;
    try {
      await q(`INSERT INTO memberships (user_id, business_id, role) VALUES ('${NEWBIE_ID}', '${EMPTY_BIZ}', 'business_owner')`);
      claimOk = true;
    } catch (e) { /* failed */ }
    check('first-owner claim of an EMPTY business allowed (onboarding flow)', claimOk);

    // A DIFFERENT user with no memberships now tries to claim the same
    // business, which already has a member (the owner-claim bypass probe).
    await be('authenticated', ELEVATE_ID);
    let elevateBlocked = false;
    let elevateMsg = '(no error — insert SUCCEEDED)';
    try {
      await q(`INSERT INTO memberships (user_id, business_id, role) VALUES ('${ELEVATE_ID}', '${EMPTY_BIZ}', 'business_owner')`);
    } catch (e) {
      elevateMsg = e.message;
      elevateBlocked = /row-level security|violates/.test(e.message);
    }
    check('second user CANNOT self-elevate into a business that has members', elevateBlocked, elevateMsg.slice(0, 120));

    // Impersonate a real non-member of the platform business before
    // probing (the identity must match the row being inserted, or the
    // test would pass for the wrong reason).
    await be('authenticated', NEWBIE_ID);
    let adminHijackBlocked = false;
    let hijackMsg = '(no error)';
    try {
      await q(`INSERT INTO memberships (user_id, business_id, role) VALUES ('${NEWBIE_ID}', '${PLATFORM_BIZ}', 'business_owner')`);
    } catch (e) {
      hijackMsg = e.message;
      adminHijackBlocked = /row-level security|violates/.test(e.message);
    }
    check('CANNOT hijack the platform business (privilege escalation closed)', adminHijackBlocked, hijackMsg.slice(0, 120));

    // The /admin gate reads `memberships WHERE user_id = me AND
    // role = 'platform_admin'`, so the LAST way to fool the gate is
    // writing that row directly. 004's WITH CHECK requires
    // role = 'business_owner', so a client INSERT of an admin row must
    // be rejected before any visibility logic even matters.
    let directAdminBlocked = false;
    let directMsg = '(no error — insert SUCCEEDED)';
    try {
      await q(`INSERT INTO memberships (user_id, business_id, role) VALUES ('${NEWBIE_ID}', '${DRAFT_BIZ}', 'platform_admin')`);
    } catch (e) {
      directMsg = e.message;
      directAdminBlocked = /row-level security|violates/.test(e.message);
    }
    check('CANNOT INSERT a platform_admin membership row directly', directAdminBlocked, directMsg.slice(0, 120));

    const gateDirect = await one(`SELECT count(*)::int AS n FROM memberships WHERE user_id = '${NEWBIE_ID}' AND role = 'platform_admin'`);
    check('admin gate still DENIED after direct-insert attempt', gateDirect.n === 0, `rows=${gateDirect.n}`);

    // Role self-edit probe: clients must not be able to UPDATE or
    // DELETE membership rows at all (004 revokes the privilege; only
    // the service-role team API may do either).
    let roleEditDenied = false;
    let roleMsg = '(no error — UPDATE SUCCEEDED)';
    try {
      await q(`UPDATE memberships SET role = 'platform_admin' WHERE user_id = '${NEWBIE_ID}'`);
    } catch (e) {
      roleMsg = e.message;
      roleEditDenied = /permission denied|row-level security|violates/.test(e.message);
    }
    check('CANNOT UPDATE own membership role to platform_admin', roleEditDenied, roleMsg.slice(0, 120));

    const gateAfter = await one(`SELECT count(*)::int AS n FROM memberships WHERE user_id = '${NEWBIE_ID}' AND role = 'platform_admin'`);
    check('admin gate still DENIED after role-edit attempt', gateAfter.n === 0, `rows=${gateAfter.n}`);

    let delDenied = false;
    let delMsg = '(no error — DELETE SUCCEEDED)';
    try {
      await q(`DELETE FROM memberships WHERE user_id = '${NEWBIE_ID}'`);
    } catch (e) {
      delMsg = e.message;
      delDenied = /permission denied|row-level security|violates/.test(e.message);
    }
    check('CANNOT DELETE own membership row as a client', delDenied, delMsg.slice(0, 120));

    // ── 8. service-role bypass (the /api/team roster pattern) ─────
    await be('service_role', null);
    const roster = await one(`SELECT count(*)::int AS n FROM memberships WHERE business_id = '${PLATFORM_BIZ}'`);
    const emailsViaAdmin = await one(`SELECT count(*)::int AS n FROM auth.users`);
    check('service_role reads full roster (team API pattern)', roster.n === 2, `rows=${roster.n}`);
    check('service_role can list users for email resolution', emailsViaAdmin.n === 5, `users=${emailsViaAdmin.n}`);

    // ── 9. RLS enabled on EVERY public table ──────────────────────
    await q('RESET ROLE');
    const rls = await one(`
      SELECT count(*) FILTER (WHERE NOT c.relrowsecurity)::int AS unprotected,
             count(*)::int AS total
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    `);
    check('RLS enabled on every public table', rls.unprotected === 0, `${rls.total - rls.unprotected}/${rls.total} tables`);

    // ── 10. Migration 005 idempotency ─────────────────────────────
    const mig005 = readFileSync(path.join(MIG_DIR, files.find((f) => f.includes('005_default_admin'))), 'utf8');
    await q(mig005);
    const again = await one(`SELECT
      (SELECT count(*)::int FROM auth.users WHERE email = 'admin@bas.local') AS users,
      (SELECT count(*)::int FROM memberships WHERE role = 'platform_admin') AS gates,
      (SELECT count(*)::int FROM businesses WHERE name = 'BAS Platform') AS orgs`);
    check('005 re-run is idempotent (no duplicates)', again.users === 1 && again.gates === 1 && again.orgs === 1,
      JSON.stringify(again));

    await client.end();
  } finally {
    await ep.stop();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('FAILED:');
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail ?? ''}`);
    process.exitCode = 1; // natural exit so buffered stdout flushes
  }
}

main().catch((e) => {
  console.error('\nHARNESS ERROR:', e && e.message ? e.message : String(e));
  process.exit(2);
});
