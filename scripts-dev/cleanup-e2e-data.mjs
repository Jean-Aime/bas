// Cleanup for E2E test rows in the LIVE Supabase project.
//
// Deletes the E2E test users and test businesses left behind by automated
// testing. Businesses are deleted via PostgREST so the FK cascades wipe all
// child rows (conversations, messages, orders, bookings, requests, workflow
// runs, notifications, audit logs); users are deleted via auth.admin.
//
// SAFETY MODEL:
//   1. Dry-run by default. Only `--apply` mutates anything.
//   2. Refuses to touch rows that look like real customer data (see LOOKALIKE
//      warnings below) unless `--force` is also passed.
//   3. Every delete target and its child-row counts are printed before and
//      after, so the effect is auditable.
//
// Configuration (CLI flags win over env):
//   --url <project-url>            or SUPABASE_URL
//   --service-key <secret-key>     or SUPABASE_SERVICE_ROLE_KEY  (sb_secret_... or legacy service_role JWT)
//   --users <id|email,id|email>    or E2E_TEST_USERS
//   --businesses <id|name,...>     or E2E_TEST_BUSINESSES
//   --apply                        actually delete (default: dry run)
//   --force                        also delete businesses/users that look like production data
//   --list                         discovery mode: print all users + businesses, change nothing
//
// Usage:
//   node scripts-dev/cleanup-e2e-data.mjs --list                # discover targets (safe)
//   node scripts-dev/cleanup-e2e-data.mjs                       # dry run with env creds
//   node scripts-dev/cleanup-e2e-data.mjs --apply               # delete after reviewing the dry run
//
// NOTE: unlike the rest of scripts-dev, this one touches the live project and
// is therefore NOT wired into any automated task.

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const hasFlag = (name) => args.includes(`--${name}`);

const APPLY = hasFlag('apply');
const FORCE = hasFlag('force');
const url = flag('url') || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  flag('service-key') || process.env.SUPABASE_SERVICE_ROLE_KEY;
const usersArg = flag('users') || process.env.E2E_TEST_USERS || '';
const businessesArg = flag('businesses') || process.env.E2E_TEST_BUSINESSES || '';

if (!url || !serviceKey) {
  console.error('Missing --url / SUPABASE_URL or --service-key / SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(2);
}
// ---------------------------------------------------------------------------
// Discovery mode: list every user and business, touch nothing.
// ---------------------------------------------------------------------------
if (hasFlag('list')) {
  const usersRes = await fetch(`${api}/auth/v1/admin/users?per_page=200`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!usersRes.ok) throw new Error(`listUsers failed: ${usersRes.status} ${await usersRes.text()}`);
  const { users } = await usersRes.json();
  console.log('=== USERS (auth.users) ===');
  for (const u of users) {
    console.log(`${u.id}  ${(u.email || '(no email)').padEnd(35)}  created ${u.created_at}`);
  }
  const bizRows = await rest('/rest/v1/businesses?select=id,name,city,country,status,created_at&order=created_at.asc');
  console.log('\n=== BUSINESSES (public.businesses) ===');
  for (const b of bizRows) {
    console.log(`${b.id}  ${b.name.padEnd(35)}  ${b.status}  ${b.created_at}`);
  }
  console.log(`\n${users.length} user(s), ${bizRows.length} business(es). Nothing was changed.`);
  process.exit(0);
}

if (!usersArg && !businessesArg) {
  console.error('Nothing to do: pass --users and/or --businesses (IDs, emails, or names), or --list to discover.');
  process.exit(2);
}

const api = `${url.replace(/\/$/, '')}`;
const restHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

/** Heuristic guard: names/emails that suggest real customer data. */
function looksLikeProduction(row) {
  const text = JSON.stringify(row).toLowerCase();
  // anything NOT clearly e2e/test-flagged gets a warning
  return !/(e2e|test|zz[_-]|delete[-_]?me|dummy)/.test(text);
}

function warnIfLookalike(kind, row) {
  if (FORCE || !looksLikeProduction(row)) return;
  console.warn(
    `  !! LOOKALIKE WARNING: this ${kind} does not match e2e/test naming patterns.\n` +
    `     It will be SKIPPED unless you re-run with --force.\n` +
    `     ${JSON.stringify(row).slice(0, 300)}`
  );
}

async function rest(path, init = {}) {
  const res = await fetch(`${api}${path}`, { ...init, headers: { ...restHeaders, ...(init.headers || {}) } });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    throw new Error(`${init.method || 'GET'} ${path} -> ${res.status}: ${typeof body === 'string' ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300)}`);
  }
  return body;
}

/** Child-row counts for a business (audit trail before/after). */
async function childCounts(businessId) {
  const tables = ['customers', 'conversations', 'messages', 'orders', 'bookings', 'requests', 'workflow_executions', 'workflow_execution_logs', 'notifications', 'audit_logs'];
  const counts = {};
  for (const t of tables) {
    const rows = await rest(`/rest/v1/${t}?select=id&business_id=eq.${businessId}`);
    counts[t] = rows.length;
  }
  return counts;
}

const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

// ---------------------------------------------------------------------------
// 1. Resolve users
// ---------------------------------------------------------------------------
const userTargets = usersArg.split(',').map((s) => s.trim()).filter(Boolean);
const foundUsers = [];
if (userTargets.length) {
  // auth.admin.listUsers via the GoTrue admin endpoint (service key required)
  const res = await fetch(`${api}/auth/v1/admin/users?per_page=200`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) throw new Error(`listUsers failed: ${res.status} ${await res.text()}`);
  const { users } = await res.json();
  for (const target of userTargets) {
    const match = users.find(
      (u) => u.id === target || (u.email || '').toLowerCase() === target.toLowerCase()
    );
    if (match) {
      foundUsers.push(match);
    } else {
      console.warn(`  ? user "${target}" not found in auth.users — skipping`);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Resolve businesses (id or exact name)
// ---------------------------------------------------------------------------
const bizTargets = businessesArg.split(',').map((s) => s.trim()).filter(Boolean);
const foundBusinesses = [];
for (const target of bizTargets) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);
  const filter = isUuid ? `id=eq.${target}` : `name=eq.${encodeURIComponent(target)}`;
  const rows = await rest(`/rest/v1/businesses?select=id,name,city,country&${filter}`);
  if (rows.length === 0) {
    console.warn(`  ? business "${target}" not found — skipping`);
  } else if (rows.length > 1) {
    console.warn(`  ? business "${target}" matched ${rows.length} rows — skipping (pass the id instead)`);
  } else {
    foundBusinesses.push(rows[0]);
  }
}

// ---------------------------------------------------------------------------
// 3. Report plan
// ---------------------------------------------------------------------------
console.log(`\n=== ${APPLY ? 'APPLY' : 'DRY RUN'} — ${foundUsers.length} user(s), ${foundBusinesses.length} business(es) ===\n`);

const plan = [];
for (const u of foundUsers) {
  warnIfLookalike('user', u);
  if (looksLikeProduction(u) && !FORCE) continue;
  plan.push({ kind: 'user', id: u.id, label: u.email || u.id });
}
for (const b of foundBusinesses) {
  warnIfLookalike('business', b);
  if (looksLikeProduction(b) && !FORCE) continue;
  const counts = await childCounts(b.id);
  plan.push({ kind: 'business', id: b.id, label: b.name, childRows: sum(counts), counts });
}

for (const item of plan) {
  if (item.kind === 'user') {
    console.log(`user  ${item.id}  ${item.label}`);
  } else {
    console.log(`biz   ${item.id}  ${item.label}  (child rows: ${item.childRows})`);
    if (item.childRows > 0) console.log('       ' + JSON.stringify(item.counts));
  }
}

if (plan.length === 0) {
  console.log('Nothing matched the safety criteria — no deletions planned.');
  process.exit(0);
}

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to delete the rows listed above.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 4. Execute (businesses first so cascades run, then users)
// ---------------------------------------------------------------------------
let failures = 0;
for (const item of plan.filter((p) => p.kind === 'business')) {
  try {
    await rest(`/rest/v1/businesses?id=eq.${item.id}`, { method: 'DELETE' });
    const after = await childCounts(item.id);
    console.log(`deleted business ${item.id} (${item.label}); remaining child rows: ${sum(after)}`);
  } catch (e) {
    failures++;
    console.error(`FAILED to delete business ${item.id}: ${e.message}`);
  }
}
for (const item of plan.filter((p) => p.kind === 'user')) {
  try {
    const res = await fetch(`${api}/auth/v1/admin/users/${item.id}`, {
      method: 'DELETE',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    console.log(`deleted user ${item.id} (${item.label})`);
  } catch (e) {
    failures++;
    console.error(`FAILED to delete user ${item.id}: ${e.message}`);
  }
}

const ops = (n) => `${n} delete operation${n === 1 ? '' : 's'}`;
console.log(failures === 0 ? '\nDONE — all targeted rows deleted.' : `\nDONE WITH ${ops(failures)} FAILED.`);
