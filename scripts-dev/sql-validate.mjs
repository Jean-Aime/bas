// One-shot validation harness: run setup.sql on a fresh embedded Postgres
// (pglite = real Postgres compiled to WASM) with Supabase-compatible
// scaffolding, then exercise migration 004's hardened anon policies.
//
// RLS only bites non-superusers, so every behavior test runs under
// SET ROLE anon / authenticated — never as the superuser connection.
//
// Usage: node scripts-dev/sql-validate.mjs
// No secrets involved — everything is local and ephemeral.

import { readFileSync } from 'fs';
import { PGlite } from '@electric-sql/pglite';

const read = (p) => readFileSync(p, 'utf8');

const setup = read('supabase/setup.sql');
const mig004 = read('supabase/migrations/20260907230000_004_harden_anon_chat_policies.sql');

// ---------------------------------------------------------------- scaffolding
// setup.sql targets a Supabase-shaped database. pglite gives us bare Postgres,
// so create the substrate pieces the file references:
//   1. auth.users (FK target) + auth.uid() helper
//   2. anon/authenticated roles (TO targets of every policy)
//   3. Supabase-style grants (the platform grants DML to these roles)
//   4. an empty supabase_realtime publication so the DO block is exercisable
async function scaffold(db) {
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
      LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
    END $$;
    CREATE PUBLICATION supabase_realtime;
  `);
}

// Supabase grants DML on public tables to anon/authenticated; bare Postgres
// grants nothing, so policies would be shadowed by permission errors.
async function grantPlatformPrivileges(db) {
  await db.exec(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
  `);
}

// ------------------------------------------------------- role impersonation
async function asAdmin(db) { await db.exec('RESET ROLE'); }
async function asAnon(db) { await db.exec('SET ROLE anon'); }
async function asUser(db, uuid) {
  await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '${uuid}', false)`);
}

// ------------------------------------------------------------------- helpers
const one = async (db, sql) => (await db.query(sql)).rows;

async function expect(db, label, fn, { wantError } = {}) {
  try {
    const res = await fn(db);
    if (wantError) throw new Error(`${label}: expected failure, got success`);
    return res;
  } catch (e) {
    if (!wantError) throw new Error(`${label}: unexpected failure → ${e.message}`);
    if (!/row-level security|policy/i.test(e.message)) {
      throw new Error(`${label}: failed with WRONG error → ${e.message}`);
    }
    return null;
  }
}

let failures = 0;
const step = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const bizId = '11111111-1111-1111-1111-111111111111';
const otherBiz = '22222222-2222-2222-2222-222222222222';
const owner = '33333333-3333-3333-3333-333333333333';
const rival = '44444444-4444-4444-4444-444444444444';

const db = new PGlite();

try {
  // 1. Fresh database runs the whole file without a single error.
  await scaffold(db);
  const t0 = Date.now();
  await db.exec(setup);
  step('setup.sql executes on a fresh database', true, `${Date.now() - t0}ms`);

  // 2. Schema inventory: 25 tables, RLS on everywhere, 123 policies.
  const tables = await one(db, `SELECT count(*)::int n FROM pg_tables WHERE schemaname='public'`);
  step('25 tables created', tables[0].n === 25, `got ${tables[0].n}`);

  const unsecured = await one(db, `SELECT count(*)::int n FROM pg_tables WHERE schemaname='public' AND NOT rowsecurity`);
  step('RLS enabled on all public tables', unsecured[0].n === 0, `${unsecured[0].n} without RLS`);

  const policies = await one(db, `SELECT count(*)::int n FROM pg_policies WHERE schemaname='public'`);
  step('123 policies created', policies[0].n === 123, `got ${policies[0].n}`);

  // 3. Realtime publication block works (pre-created publication absorbs the adds).
  const pub = await one(db, `SELECT count(*)::int n FROM pg_publication_tables WHERE pubname='supabase_realtime'`);
  step('realtime publication includes the 8 streaming tables', pub[0].n === 8, `got ${pub[0].n}`);

  // 4. Idempotency: a second full run must succeed untouched.
  await db.exec(setup);
  await grantPlatformPrivileges(db);
  step('setup.sql is idempotent (second full run)', true);

  // 5. is_business_member() exists and is SECURITY DEFINER.
  const fn = await one(db, `SELECT prosecdef FROM pg_proc WHERE proname='is_business_member'`);
  step('is_business_member() SECURITY DEFINER', fn[0]?.prosecdef === true);

  // ---- behavior tests: migration 004's hardened anon policies ----
  await db.exec(mig004);
  await grantPlatformPrivileges(db); // re-grant: policy re-creation doesn't drop grants, but be explicit
  step('migration 004 executes after setup.sql', true);

  // Seed fixture as superuser (owner-only inserts would otherwise need JWTs).
  await asAdmin(db);
  await db.exec(`
    INSERT INTO auth.users (id) VALUES ('${owner}'), ('${rival}');
    INSERT INTO businesses (id, name, type) VALUES ('${bizId}', 'Local Test Cafe', 'restaurant');
    INSERT INTO businesses (id, name, type) VALUES ('${otherBiz}', 'Rival Bistro', 'restaurant');
    INSERT INTO customers (id, business_id, name) VALUES ('aaaaaaaa-0000-0000-0000-000000000001', '${bizId}', 'Test Customer');
  `);

  // 6. Anon opens a chat thread for a real business → allowed, row returned.
  await asAnon(db);
  const conv = await expect(db, 'anon valid conversation insert', (d) =>
    one(db, `INSERT INTO conversations (business_id, channel) VALUES ('${bizId}', 'web_chat') RETURNING id`)
  );
  step('anon INSERT web_chat conversation for real business', !!conv[0]?.id, `id=${conv[0]?.id}`);
  const convId = conv[0].id;

  // 7. Policy-only constraint the FK cannot express: channel must be web_chat.
  await expect(db, 'anon conversation insert with wrong channel', (d) =>
    one(db, `INSERT INTO conversations (business_id, channel) VALUES ('${bizId}', 'whatsapp')`)
  , { wantError: true });
  step('anon INSERT conversation with channel≠web_chat blocked by policy', true);

  // 8. Messages must be bound to a conversation of the SAME business.
  await one(db, `INSERT INTO messages (business_id, conversation_id, sender_type, content)
                 VALUES ('${bizId}', '${convId}', 'customer', 'hello')`);
  step('anon INSERT message referencing real conversation', true);

  // FK passes here (conversation exists); only the policy's parent-binding blocks.
  await expect(db, 'anon message with mismatched business', (d) =>
    one(db, `INSERT INTO messages (business_id, conversation_id, sender_type, content)
             VALUES ('${otherBiz}', '${convId}', 'customer', 'x')`)
  , { wantError: true });
  step('anon INSERT message bound to wrong business blocked by policy', true);

  // 9. Anon reads needed by the chat widget stay open; writes to catalog stay shut.
  const sel = await one(db, `SELECT count(*)::int n FROM conversations`);
  step('anon SELECT conversations readable', sel[0].n === 1, `got ${sel[0].n}`);

  const bizSel = await one(db, `SELECT count(*)::int n FROM businesses`);
  step('anon SELECT businesses (public catalog) readable', bizSel[0].n === 2, `got ${bizSel[0].n}`);

  await expect(db, 'anon products insert', (d) =>
    one(db, `INSERT INTO products (business_id, name, price, currency) VALUES ('${bizId}', 'Anon Latte', 1, 'RWF')`)
  , { wantError: true });
  step('anon INSERT products blocked', true);

  // 10. Authenticated owner path still works after 004 (real mode intact).
  await asUser(db, owner);
  await one(db, `INSERT INTO memberships (user_id, business_id, role) VALUES ('${owner}', '${bizId}', 'business_owner')`);
  await one(db, `INSERT INTO products (business_id, name, price, currency) VALUES ('${bizId}', 'Latte', 3000, 'RWF')`);
  step('authenticated owner INSERT product passes (real mode intact)', true);

  const ownerReads = await one(db, `SELECT count(*)::int n FROM products WHERE business_id='${bizId}'`);
  step('owner reads back their product through RLS', ownerReads[0].n === 1, `got ${ownerReads[0].n}`);

  // 11. Another tenant's owner cannot write into bizId's catalog.
  await asUser(db, rival);
  await one(db, `INSERT INTO memberships (user_id, business_id, role) VALUES ('${rival}', '${otherBiz}', 'business_owner')`);
  await expect(db, 'cross-tenant product insert', (d) =>
    one(db, `INSERT INTO products (business_id, name, price, currency) VALUES ('${bizId}', 'Hacked Latte', 1, 'RWF')`)
  , { wantError: true });
  step('cross-tenant authenticated INSERT blocked', true);

  // Catalog SELECT is intentionally public for active rows (chat needs it);
  // the tenant boundary shows on inactive rows instead.
  await asUser(db, owner);
  await one(db, `INSERT INTO products (business_id, name, price, currency, is_active)
                 VALUES ('${bizId}', 'Secret Test Batch', 100, 'RWF', false)`);
  const ownerInactive = await one(db, `SELECT count(*)::int n FROM products WHERE is_active = false`);
  step('owner sees their own inactive product', ownerInactive[0].n === 1, `got ${ownerInactive[0].n}`);

  await asUser(db, rival);
  const rivalSees = await one(db, `SELECT count(*)::int n FROM products`);
  step('rival sees active catalog but NOT the inactive product', rivalSees[0].n === 1, `got ${rivalSees[0].n}`);
} catch (e) {
  step('harness', false, e.message);
} finally {
  await db.close();
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}
