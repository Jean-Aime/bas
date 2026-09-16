import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDemoSupabaseClient, resetDemoData, DEMO_USER } from '@/lib/demo/demo-client';

/**
 * Unit tests for the demo-mode Supabase stand-in (lib/demo/demo-client.ts).
 * Covers the builder surface the app actually uses: filters, ordering,
 * pagination, writes, single/maybeSingle semantics, embedded joins, and auth.
 *
 * Each test starts from a freshly seeded snapshot (resetDemoData).
 */

const client = createDemoSupabaseClient();

beforeEach(() => {
  resetDemoData();
});

afterEach(() => {
  resetDemoData();
});

/* ---------------------------------------------------------------------- */
/* Basic selects                                                            */
/* ---------------------------------------------------------------------- */

describe('demo client — basic selects', () => {
  it('returns all rows for select(*)', async () => {
    const { data, error } = await client.from('businesses').select('*');
    expect(error).toBeNull();
    expect(data).toHaveLength(3);
  });

  it('projects plain column lists', async () => {
    const { data } = await client.from('businesses').select('id, name');
    expect(data![0]).toEqual({ id: expect.any(String), name: expect.any(String) });
    expect(Object.keys(data![0])).toEqual(['id', 'name']);
  });

  it('returns an error for unknown tables', async () => {
    const { data, error } = await client.from('not_a_table').select('*');
    expect(data).toBeNull();
    expect(error!.code).toBe('42P01');
    expect(error!.message).toContain('not_a_table');
  });
});

/* ---------------------------------------------------------------------- */
/* Filters                                                                  */
/* ---------------------------------------------------------------------- */

describe('demo client — filters', () => {
  it('.eq() filters by exact value', async () => {
    const { data } = await client.from('businesses').select('*').eq('type', 'salon');
    expect(data).toHaveLength(1);
    expect(data![0].name).toBe('Beauty Salon Kigali');
  });

  it('.eq() with null matches null columns', async () => {
    const { data } = await client.from('workflows').select('*').eq('business_id', 'biz_salon');
    const appt = data!.find((w) => w.id === 'wf_salon_appt');
    expect(appt).toBeTruthy();
    const { data: nullTpl } = await client.from('workflows').select('*').eq('template_id', null);
    // template_id is null only for the bespoke salon workflow
    expect(nullTpl!.every((w) => w.template_id === null)).toBe(true);
    expect(nullTpl!.some((w) => w.id === 'wf_salon_appt')).toBe(true);
  });

  it('.neq() excludes matches', async () => {
    const { data } = await client.from('businesses').select('*').neq('type', 'salon');
    expect(data).toHaveLength(2);
    expect(data!.every((b) => b.type !== 'salon')).toBe(true);
  });

  it('.gte()/.lt() compare ISO timestamps lexicographically', async () => {
    const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
    const { data } = await client.from('messages').select('created_at').gte('created_at', since);
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.every((m) => m.created_at >= since)).toBe(true);
  });

  it('.is(null) matches nulls', async () => {
    const { data } = await client.from('conversations').select('*').is('assigned_to', null);
    expect(data!.every((c) => c.assigned_to === null)).toBe(true);
    expect(data!.length).toBeGreaterThan(0);
  });

  it('.in() matches any listed value', async () => {
    const { data } = await client.from('orders').select('*').in('status', ['pending', 'confirmed']);
    expect(data!.every((o) => ['pending', 'confirmed'].includes(o.status))).toBe(true);
    expect(data!.length).toBeGreaterThan(0);
  });

  it('.ilike() applies PostgREST wildcard semantics case-insensitively', async () => {
    const { data } = await client.from('workflows').select('*').ilike('name', '%order%');
    expect(data!.some((w) => w.name === 'Order Request')).toBe(true);
  });

  it('.or() matches when any clause passes', async () => {
    const { data } = await client
      .from('conversations')
      .select('*')
      .or('detected_intent.ilike.%RETURN%,status.ilike.handover%');
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.every((c) =>
      (c.detected_intent || '').includes('RETURN') || c.status.startsWith('handover')
    )).toBe(true);
  });

  it('chains multiple filters with AND semantics', async () => {
    const { data } = await client
      .from('workflows')
      .select('*')
      .eq('business_id', 'biz_salon')
      .eq('status', 'active');
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.every((w) => w.business_id === 'biz_salon' && w.status === 'active')).toBe(true);
  });
});

/* ---------------------------------------------------------------------- */
/* Count / head                                                             */
/* ---------------------------------------------------------------------- */

describe('demo client — count and head', () => {
  it("count: 'exact' returns the filtered total", async () => {
    const { count } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', 'biz_urban_threads');
    expect(count).toBe(6);
  });

  it('head: true returns null data but a count', async () => {
    const { data, count } = await client
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', 'biz_salon');
    expect(data).toBeNull();
    expect(count).toBe(4);
  });

  it('count respects filters applied before execution', async () => {
    const { count: all } = await client.from('conversations').select('*', { count: 'exact', head: true });
    const { count: resolved } = await client
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');
    expect(all! > resolved!).toBe(true);
  });
});

/* ---------------------------------------------------------------------- */
/* Ordering and pagination                                                  */
/* ---------------------------------------------------------------------- */

describe('demo client — ordering and pagination', () => {
  it('.order() ascending sorts correctly', async () => {
    const { data } = await client.from('products').select('name').order('name');
    const names = data!.map((r) => r.name);
    expect(names).toEqual([...names].sort());
  });

  it('.order() descending puts newest conversations first', async () => {
    const { data } = await client
      .from('conversations')
      .select('created_at')
      .order('created_at', { ascending: false });
    const stamps = data!.map((r) => r.created_at as string);
    expect(stamps[0] >= stamps[stamps.length - 1]).toBe(true);
  });

  it('nulls sort last in ascending order', async () => {
    const { data } = await client.from('workflows').select('template_id').order('template_id');
    const withNull = data!.filter((w) => w.template_id === null);
    expect(withNull.length).toBeGreaterThan(0);
    expect(data![data!.length - 1].template_id).toBeNull();
  });

  it('.limit() truncates the result', async () => {
    const { data } = await client.from('messages').select('*').limit(5);
    expect(data).toHaveLength(5);
  });

  it('.range() returns the window size', async () => {
    const { data } = await client.from('messages').select('*').range(2, 7);
    expect(data).toHaveLength(6);
  });
});

/* ---------------------------------------------------------------------- */
/* single / maybeSingle                                                     */
/* ---------------------------------------------------------------------- */

describe('demo client — single/maybeSingle semantics', () => {
  it('.single() returns the one matching row', async () => {
    const { data, error } = await client
      .from('businesses')
      .select('*')
      .eq('id', 'biz_salon')
      .single();
    expect(error).toBeNull();
    expect(data!.name).toBe('Beauty Salon Kigali');
  });

  it('.single() errors with PGRST116 on zero rows', async () => {
    const { data, error } = await client
      .from('businesses')
      .select('*')
      .eq('id', 'does-not-exist')
      .single();
    expect(data).toBeNull();
    expect(error!.code).toBe('PGRST116');
  });

  it('.single() errors when more than one row matches', async () => {
    const { error } = await client.from('businesses').select('*').single();
    expect(error!.code).toBe('PGRST116');
  });

  it('.maybeSingle() returns null (no error) on zero rows', async () => {
    const { data, error } = await client
      .from('businesses')
      .select('*')
      .eq('id', 'does-not-exist')
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it('.maybeSingle() returns the row when exactly one matches', async () => {
    const { data, error } = await client
      .from('memberships')
      .select('*')
      .eq('business_id', 'biz_hotel')
      .maybeSingle();
    expect(error).toBeNull();
    expect(data!.user_id).toBe(DEMO_USER.id);
  });
});

/* ---------------------------------------------------------------------- */
/* Embedded joins                                                           */
/* ---------------------------------------------------------------------- */

describe('demo client — embedded joins', () => {
  it("'*, businesses(*)' attaches the parent business to memberships", async () => {
    const { data, error } = await client.from('memberships').select('*, businesses(*)');
    expect(error).toBeNull();
    // 3 owner memberships + 1 demo platform_admin membership
    expect(data).toHaveLength(4);
    for (const row of data!) {
      expect(row.businesses).toMatchObject({ id: row.business_id });
      expect(row.businesses.name).toBeTruthy();
    }
  });

  it('embedded join works through chained filters', async () => {
    const { data } = await client
      .from('memberships')
      .select('*, businesses(*)')
      .eq('business_id', 'biz_urban_threads')
      .eq('role', 'business_owner');
    expect(data).toHaveLength(1);
    expect(data![0].businesses.name).toBe('Urban Threads');
  });

  it('the demo user holds a platform_admin membership (admin panel gate)', async () => {
    const { data } = await client
      .from('memberships')
      .select('id')
      .eq('user_id', 'demo-user-0000-0000-0000-000000000000')
      .eq('role', 'platform_admin')
      .maybeSingle();
    expect(data).not.toBeNull();
  });
});

/* ---------------------------------------------------------------------- */
/* Writes                                                                   */
/* ---------------------------------------------------------------------- */

describe('demo client — writes', () => {
  it('insert adds a row and can return it via .select().single()', async () => {
    const { data, error } = await client
      .from('customers')
      .insert({ business_id: 'biz_urban_threads', name: 'Test Shopper' })
      .select('id, name')
      .single();
    expect(error).toBeNull();
    expect(data!.name).toBe('Test Shopper');
    expect(data!.id).toBeTruthy();

    const { count } = await client
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', 'biz_urban_threads');
    expect(count).toBe(6); // 5 seeded + 1 inserted
  });

  it('insert of multiple rows works without .select()', async () => {
    const res = await client.from('notifications').insert([
      { business_id: 'biz_hotel', user_id: DEMO_USER.id, title: 'A', message: 'a', type: 'system' },
      { business_id: 'biz_hotel', user_id: DEMO_USER.id, title: 'B', message: 'b', type: 'system' },
    ]);
    expect(res.error).toBeNull();

    const { count } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', 'biz_hotel');
    expect(count).toBe(4); // 2 seeded + 2 inserted
  });

  it('update patches matching rows and stamps updated_at', async () => {
    const before = new Date(Date.now() - 60_000).toISOString();
    await client.from('requests').insert({
      business_id: 'biz_salon', title: 'Patch me', description: null, status: 'pending', priority: 'low',
      created_at: before, updated_at: before,
    });

    const { count: resolvedBefore } = await client
      .from('requests').select('*', { count: 'exact', head: true }).eq('status', 'resolved');

    const { data } = await client
      .from('requests')
      .update({ status: 'resolved' })
      .eq('title', 'Patch me')
      .select('status, updated_at');
    expect(data).toHaveLength(1);
    expect(data![0].status).toBe('resolved');
    expect(data![0].updated_at >= before).toBe(true);

    // Exactly one more row is resolved than before — no collateral updates
    const { count: resolvedAfter } = await client
      .from('requests').select('*', { count: 'exact', head: true }).eq('status', 'resolved');
    expect(resolvedAfter).toBe(resolvedBefore! + 1);
  });

  it('delete removes matching rows only', async () => {
    const { data: created } = await client
      .from('notifications')
      .insert({ business_id: 'biz_hotel', user_id: DEMO_USER.id, title: 'Delete me', message: 'x', type: 'system' })
      .select('id')
      .single();

    const res = await client.from('notifications').delete().eq('id', created!.id);
    expect(res.error).toBeNull();

    const { data } = await client.from('notifications').select('id').eq('id', created!.id);
    expect(data).toHaveLength(0);
  });

  it('writes are visible to later queries in the same session', async () => {
    await client.from('orders').update({ status: 'cancelled' }).eq('id', 'ord_001');
    const { data } = await client.from('orders').select('status').eq('id', 'ord_001').single();
    expect(data!.status).toBe('cancelled');
  });
});

/* ---------------------------------------------------------------------- */
/* Reset semantics                                                          */
/* ---------------------------------------------------------------------- */

describe('demo client — resetDemoData', () => {
  it('restores the seeded snapshot after mutations', async () => {
    await client.from('orders').update({ status: 'cancelled' }).eq('id', 'ord_001');
    let row = await client.from('orders').select('status').eq('id', 'ord_001').single();
    expect(row.data!.status).toBe('cancelled');

    resetDemoData();

    row = await client.from('orders').select('status').eq('id', 'ord_001').single();
    expect(row.data!.status).toBe('completed');
  });
});

/* ---------------------------------------------------------------------- */
/* Auth and channels                                                        */
/* ---------------------------------------------------------------------- */

describe('demo client — auth and realtime', () => {
  it('getSession fakes a signed-in demo owner', async () => {
    const { data } = await client.auth.getSession();
    expect(data.session!.user.email).toBe('demo@bas.app');
  });

  it('onAuthStateChange emits SIGNED_IN with the demo user', async () => {
    let event = '';
    let user: unknown = null;
    const sub = client.auth.onAuthStateChange((evt, session) => {
      event = evt;
      user = (session as { user?: unknown } | null)?.user ?? null;
    });
    expect(event).toBe('SIGNED_IN');
    expect(user).toMatchObject({ id: DEMO_USER.id });
    sub.data.subscription.unsubscribe();
  });

  it('auth.admin.listUsers returns the demo user (team route)', async () => {
    const { data } = await client.auth.admin.listUsers({ page: 1, perPage: 10 });
    expect(data.users).toHaveLength(1);
  });

  it('channels subscribe cleanly and removeChannel resolves', async () => {
    const statuses: string[] = [];
    const channel = client.channel('test');
    const chan = channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {})
      .subscribe((status) => statuses.push(status));
    expect(statuses).toEqual(['SUBSCRIBED']);
    expect(chan).toBeTruthy();
    await expect(client.removeChannel(chan)).resolves.toBe('ok');
  });

  it('rpc returns an explicit error (not silently empty)', async () => {
    const { data, error } = await client.rpc('some_function');
    expect(data).toBeNull();
    expect(error!.code).toBe('42883');
  });
});
