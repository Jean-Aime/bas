import { buildDemoDataset, type DemoDataset } from './demo-data';

/**
 * Demo Supabase client — an in-memory, queryable stand-in for supabase-js
 * covering exactly the builder surface this app uses:
 *
 *   from(table).select(cols, {count, head}).eq().neq().gt().gte().lt().lte()
 *              .is().in().ilike().or().order().limit().range()
 *              → then() / single() / maybeSingle()
 *   from(table).insert(rows).select()      → then() / single()
 *   from(table).update(patch).eq()         → then()
 *   from(table).delete().eq()              → then()
 *   channel().on('postgres_changes').subscribe() / removeChannel()
 *   auth.getSession/getUser/onAuthStateChange/signOut + auth.admin.listUsers
 *   rpc()                                  → returns an explicit error
 *
 * Writes mutate the in-memory store for the rest of the session, so the demo
 * feels live: mark a notification read, toggle a workflow, resolve a request,
 * or send chat messages end-to-end. Nothing persists — a page reload rebuilds
 * the seeded snapshot (use resetDemoData() to force it).
 */

export type PostgrestErrorShape = { message: string; code: string; details: string | null; hint: string | null };

/** Untyped rows surface like supabase-js without generated table types. */
type AnyRow = Record<string, any>;

/** Result shape for list queries (await / then on the builder). */
export interface DemoListResult<Row = AnyRow> {
  data: Row[] | null;
  error: PostgrestErrorShape | null;
  count: number | null;
  status: number;
  statusText: string;
}

/** Result shape for single()/maybeSingle(). */
export interface DemoSingleResult<Row = AnyRow> {
  data: Row | null;
  error: PostgrestErrorShape | null;
  count: null;
  status: number;
  statusText: string;
}

/* ---------------------------------------------------------------------- */
/* Table registry                                                           */
/* ---------------------------------------------------------------------- */

type Row = Record<string, any>;

const TABLE_KEYS: Record<string, keyof DemoDataset> = {
  businesses: 'businesses',
  memberships: 'memberships',
  business_profiles: 'business_profiles',
  business_hours: 'business_hours',
  business_locations: 'business_locations',
  business_policies: 'business_policies',
  business_rules: 'business_rules',
  product_categories: 'product_categories',
  products: 'products',
  service_categories: 'service_categories',
  services: 'services',
  faqs: 'faqs',
  knowledge_sources: 'knowledge_sources',
  knowledge_documents: 'knowledge_documents',
  customers: 'customers',
  conversations: 'conversations',
  messages: 'messages',
  workflows: 'workflows',
  workflow_executions: 'workflow_executions',
  workflow_execution_logs: 'workflow_execution_logs',
  orders: 'orders',
  bookings: 'bookings',
  requests: 'requests',
  notifications: 'notifications',
  audit_logs: 'audit_logs',
};

/* ---------------------------------------------------------------------- */
/* Mutable store                                                            */
/* ---------------------------------------------------------------------- */

let store: DemoDataset | null = null;

/** The live dataset — built on first access, mutated by writes. */
function ensureStore(): DemoDataset {
  if (!store) store = buildDemoDataset();
  return store;
}

/** Reset to the freshly seeded snapshot — used by the demo reset action. */
export function resetDemoData(): void {
  store = null;
}

function rowsFor(table: string): Row[] | null {
  const key = TABLE_KEYS[table];
  if (!key) return null;
  const dataset = ensureStore() as unknown as Record<string, Row[]>;
  return dataset[key] || null;
}

export const DEMO_USER = {
  id: 'demo-user-0000-0000-0000-000000000000',
  email: 'demo@bas.app',
  user_metadata: { full_name: 'Demo Owner' },
};

/* ---------------------------------------------------------------------- */
/* Filter helpers                                                           */
/* ---------------------------------------------------------------------- */

function parseIlikePattern(pattern: string): RegExp {
  // PostgREST ilike: % and _ wildcards, case-insensitive.
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
}

function applyPostgrestOr(filterStr: string): (row: Row) => boolean {
  // Handles the app's .or() strings, e.g.
  // "detected_intent.ilike.%q%,channel.ilike.q%,status.ilike.q%"
  const clauses = filterStr.split(',').map((c) => c.trim()).filter(Boolean);
  return (row) =>
    clauses.some((clause) => {
      const m = clause.match(/^(\w+)\.(ilike|eq|neq|gte|gt|lte|lt|is|in)\.(.*)$/);
      if (!m) return false;
      const [, col, op, rawVal] = m;
      const val = row[col];
      switch (op) {
        case 'ilike': return parseIlikePattern(rawVal).test(String(val ?? ''));
        case 'eq': return String(val) === rawVal;
        case 'neq': return String(val) !== rawVal;
        case 'gte': return String(val) >= rawVal;
        case 'gt': return String(val) > rawVal;
        case 'lte': return String(val) <= rawVal;
        case 'lt': return String(val) < rawVal;
        case 'is': return rawVal === 'null' ? val == null : String(val) === rawVal;
        case 'in': {
          const items = rawVal.replace(/^\(|\)$/g, '').split(',').map((s) => s.trim());
          return items.includes(String(val));
        }
        default: return false;
      }
    });
}

function makeProjection(select: string): ((row: Row) => Row) | null {
  // Plain column lists project; bare '*' returns rows untouched. Embedded
  // joins ('*, businesses(*)') copy the full row and attach the joined record.
  const s = (select || '*').trim();
  const hasBusinessesEmbed = /\bbusinesses\s*\(/.test(s);
  if (s === '*' && !hasBusinessesEmbed) return null;
  const cols = s.split(',').map((c) => c.trim()).filter((c) => c && c !== '*' && !c.includes('('));
  if (cols.length === 0 && !hasBusinessesEmbed) return null;
  const dataset = ensureStore();
  return (row) => {
    let out: Row;
    if (cols.length === 0) {
      out = { ...row };
    } else {
      out = {};
      for (const col of cols) out[col] = row[col];
    }
    // Embedded resource used by business-context: memberships.businesses(*)
    if (hasBusinessesEmbed && row.business_id) {
      out.businesses = dataset.businesses.find((b) => b.id === row.business_id) || null;
    }
    return out;
  };
}

/* ---------------------------------------------------------------------- */
/* Query builder                                                            */
/* ---------------------------------------------------------------------- */

type QueryMode = 'select' | 'insert' | 'update' | 'delete';

class DemoQuery<RowType = Row> {
  private filters: Array<(row: Row) => boolean> = [];
  private orders: Array<{ col: string; asc: boolean }> = [];
  private limitN: number | null = null;
  private selectStr: string;
  private selectOpts: { count?: string | null; head?: boolean };
  private returnSelect: boolean;

  constructor(
    private table: string,
    private mode: QueryMode = 'select',
    private payload: Row | Row[] | null = null,
    selectStr = '*',
    selectOpts: { count?: string | null; head?: boolean } = {},
    returnSelect = false
  ) {
    this.selectStr = selectStr;
    this.selectOpts = selectOpts;
    this.returnSelect = returnSelect;
  }

  /* -------- builder methods (chainable) -------- */

  select(select = '*', options: { count?: string | null; head?: boolean } = {}): DemoQuery<Row> {
    // Preserve any filters/orders accumulated before .select() — supabase-js's
    // builder is mutable, so update().eq(...).select(...) must keep its WHERE.
    const next = new DemoQuery<Row>(this.table, this.mode, this.payload, select, options, this.mode !== 'select');
    next.filters = [...this.filters];
    next.orders = [...this.orders];
    return next;
  }

  insert(payload: Row | Row[]): DemoQuery<Row> {
    return new DemoQuery<Row>(this.table, 'insert', payload);
  }

  update(payload: Row): DemoQuery<Row> {
    return new DemoQuery<Row>(this.table, 'update', payload);
  }

  delete(): DemoQuery<Row> {
    return new DemoQuery<Row>(this.table, 'delete');
  }

  eq(col: string, val: unknown): this { this.filters.push((r) => r[col] === val); return this; }
  neq(col: string, val: unknown): this { this.filters.push((r) => r[col] !== val); return this; }
  gt(col: string, val: unknown): this { this.filters.push((r) => String(r[col]) > String(val)); return this; }
  gte(col: string, val: unknown): this { this.filters.push((r) => String(r[col]) >= String(val)); return this; }
  lt(col: string, val: unknown): this { this.filters.push((r) => String(r[col]) < String(val)); return this; }
  lte(col: string, val: unknown): this { this.filters.push((r) => String(r[col]) <= String(val)); return this; }
  is(col: string, val: unknown): this { this.filters.push((r) => (val === null ? r[col] == null : r[col] === val)); return this; }
  in(col: string, vals: unknown[]): this { this.filters.push((r) => vals.includes(r[col])); return this; }
  ilike(col: string, pattern: string): this { const re = parseIlikePattern(pattern); this.filters.push((r) => re.test(String(r[col] ?? ''))); return this; }
  or(filterStr: string): this { this.filters.push(applyPostgrestOr(filterStr)); return this; }
  order(col: string, options: { ascending?: boolean } = {}): this { this.orders.push({ col, asc: options.ascending !== false }); return this; }
  limit(n: number): this { this.limitN = n; return this; }
  range(from: number, to: number): this { this.limitN = to - from + 1; return this; }

  single(): PromiseLike<DemoSingleResult<RowType>> {
    return this.executeThenable(true, false);
  }

  maybeSingle(): PromiseLike<DemoSingleResult<RowType>> {
    return this.executeThenable(false, true);
  }

  private executeThenable(single: boolean, maybe: boolean): PromiseLike<DemoSingleResult<RowType>> {
    const promise = this.execute(single, maybe);
    return {
      then: <R1, R2>(
        onf?: ((v: DemoSingleResult<RowType>) => R1 | PromiseLike<R1>) | null,
        onr?: ((r: unknown) => R2 | PromiseLike<R2>) | null
      ) => promise.then((v) => v as DemoSingleResult<RowType>).then(onf, onr),
    };
  }

  then<TResult1 = DemoListResult<RowType>, TResult2 = never>(
    onfulfilled?: ((value: DemoListResult<RowType>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then((v) => v as DemoListResult<RowType>).then(onfulfilled, onrejected);
  }

  /* ---------------- execution ---------------- */

  private async execute(single = false, maybe = false): Promise<DemoSingleResult<RowType> | DemoListResult<RowType>> {
    const tableRows = rowsFor(this.table);
    if (!tableRows) {
      return {
        data: null,
        error: { message: `Demo mode: table "${this.table}" is not part of the demo dataset`, code: '42P01', details: null, hint: null },
        count: null,
        status: 404,
        statusText: 'Not Found',
      } as DemoListResult<RowType>;
    }

    let data: Row[];

    if (this.mode === 'insert') {
      const payloadRows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const now = new Date().toISOString();
      const newRows = payloadRows.filter((p): p is Row => p != null).map((p, i) => ({
        id: p.id || `demo_${this.table}_${Date.now()}_${i}`,
        created_at: p.created_at || now,
        updated_at: now,
        ...p,
      }));
      tableRows.push(...newRows);
      data = newRows;
    } else if (this.mode === 'update') {
      const matched = tableRows.filter((r) => this.filters.every((f) => f(r)));
      matched.forEach((r) => Object.assign(r, this.payload || {}, { updated_at: new Date().toISOString() }));
      data = matched.map((r) => ({ ...r }));
    } else if (this.mode === 'delete') {
      const matched = tableRows.filter((r) => this.filters.every((f) => f(r)));
      const matchedSet = new Set(matched);
      const key = TABLE_KEYS[this.table];
      const dataset = ensureStore() as unknown as Record<string, Row[]>;
      dataset[key] = tableRows.filter((r) => !matchedSet.has(r));
      data = matched.map((r) => ({ ...r }));
    } else {
      data = tableRows.filter((r) => this.filters.every((f) => f(r)));
    }

    // Sorting (apply in reverse so the first .order() is primary)
    for (const { col, asc } of [...this.orders].reverse()) {
      data = [...data].sort((a, b) => {
        const av = a[col] as string | number | null;
        const bv = b[col] as string | number | null;
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : 1;
        return asc ? cmp : -cmp;
      });
    }

    const limit = this.limitN;
    if (limit != null) data = data.slice(0, limit);

    // Projection — plain column lists project; '*' and embedded joins like
    // '*, businesses(*)' return full rows (the join column is added inside
    // makeProjection).
    const project = makeProjection(this.selectStr);
    const projected: unknown[] = project ? data.map(project) : data;

    if (single || maybe) {
      if (single && projected.length > 1) {
        return {
          data: null,
          error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116', details: `Results contain ${projected.length} rows`, hint: null },
          count: null,
          status: 406,
          statusText: 'Not Acceptable',
        };
      }
      if (single && projected.length === 0) {
        return {
          data: null,
          error: { message: 'No rows found', code: 'PGRST116', details: null, hint: null },
          count: null,
          status: 406,
          statusText: 'Not Acceptable',
        };
      }
      return {
        data: (projected[0] ?? null) as RowType | null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      };
    }

    const count = this.selectOpts?.count === 'exact'
      ? tableRows.filter((r) => this.filters.every((f) => f(r))).length
      : null;

    return {
      data: (this.selectOpts?.head ? null : projected) as RowType[] | null,
      count,
      error: null,
      status: 200,
      statusText: 'OK',
    };
  }
}

/* ---------------------------------------------------------------------- */
/* Demo client                                                              */
/* ---------------------------------------------------------------------- */

type DemoChannel = {
  on: (...args: unknown[]) => DemoChannel;
  subscribe: (cb?: (status: string) => void) => DemoChannel;
};

export interface DemoSupabaseClient {
  from: (table: string) => DemoQuery;
  channel: (name: string) => DemoChannel;
  removeChannel: (channel: unknown) => Promise<'ok'>;
  auth: {
    getSession: () => Promise<{ data: { session: { user: typeof DEMO_USER; access_token: string } | null }; error: null }>;
    getUser: () => Promise<{ data: { user: typeof DEMO_USER | null }; error: null }>;
    onAuthStateChange: (cb: (event: string, session: object | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
    signOut: () => Promise<{ error: null }>;
    admin: {
      listUsers: (options?: { page?: number; perPage?: number }) => Promise<{ data: { users: object[] }; error: null }>;
    };
  };
  rpc: (fn: string, _params?: Record<string, unknown>) => Promise<{ data: null; error: PostgrestErrorShape | null }>;
}

export function createDemoSupabaseClient(): DemoSupabaseClient {
  return {
    from(table: string): DemoQuery {
      return new DemoQuery(table);
    },
    channel(_name: string): DemoChannel {
      const channel: DemoChannel = {
        on: () => channel,
        subscribe: (cb) => {
          // Realtime is a no-op in demo mode; report a healthy subscription so
          // the app doesn't warn. Polling keeps notifications fresh.
          cb?.('SUBSCRIBED');
          return channel;
        },
      };
      return channel;
    },
    async removeChannel() {
      return 'ok' as const;
    },
    auth: {
      // Demo mode fakes a signed-in owner session so dashboards render.
      async getSession() {
        return { data: { session: { user: DEMO_USER, access_token: 'demo-access-token' } }, error: null };
      },
      async getUser() {
        return { data: { user: DEMO_USER }, error: null };
      },
      onAuthStateChange(cb) {
        // Emit SIGNED_IN immediately (not INITIAL_SESSION) so consumers that
        // act on the user — business-context, dashboards — resolve on mount.
        cb('SIGNED_IN', { user: DEMO_USER, access_token: 'demo-access-token' } as never);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      async signOut() {
        return { error: null };
      },
      admin: {
        async listUsers() {
          // Team management in demo mode: only the demo owner exists.
          return { data: { users: [DEMO_USER] }, error: null };
        },
      },
    },
    async rpc(fn) {
      return {
        data: null,
        error: { message: `Demo mode: rpc "${fn}" is not available`, code: '42883', details: null, hint: null },
      };
    },
  };
}
