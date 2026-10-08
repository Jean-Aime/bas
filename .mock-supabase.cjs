/**
 * Throwaway local mock of the Supabase REST/Auth API.
 * Exists ONLY so the UI can be visually verified without a real project.
 * Not part of the application — delete after design review.
 */
const http = require('http');

const USER = {
  id: 'u-11111111-1111-1111-1111-111111111111',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'claudine@urbanthreads.rw',
  email_confirmed_at: '2026-09-10T08:00:00.000Z',
  phone: '',
  created_at: '2026-09-10T08:00:00.000Z',
  updated_at: '2026-10-01T08:00:00.000Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'Claudine Uwase' },
  identities: [],
  is_anonymous: false,
};

const BUSINESS = {
  id: 'b-22222222-2222-2222-2222-222222222222',
  name: 'Urban Threads',
  type: 'clothing_store',
  country: 'Rwanda',
  city: 'Kigali',
  email: 'info@urbanthreads.rw',
  phone: '+250 788 111 222',
  description: 'Premium clothing store offering stylish apparel for men and women.',
  website_url: null,
  currency: 'RWF',
  timezone: 'UTC',
  status: 'active',
  created_at: '2026-09-10T08:00:00.000Z',
  updated_at: '2026-10-01T08:00:00.000Z',
};

const MEMBERSHIP = {
  id: 'm-33333333-3333-3333-3333-333333333333',
  user_id: USER.id,
  business_id: BUSINESS.id,
  role: 'business_owner',
  created_at: '2026-09-10T08:00:00.000Z',
  businesses: BUSINESS,
};

const now = Date.now();
const mins = (m) => new Date(now - m * 60000).toISOString();

const CONVERSATIONS = [
  { id: 'c-1', channel: 'web_chat', detected_intent: 'ORDER', status: 'active', is_handover: false, created_at: mins(12), business_id: BUSINESS.id, customer_id: null, updated_at: mins(12), confidence: 0.97, metadata: {} },
  { id: 'c-2', channel: 'web_chat', detected_intent: 'BOOKING', status: 'active', is_handover: false, created_at: mins(48), business_id: BUSINESS.id, customer_id: null, updated_at: mins(48), confidence: 0.92, metadata: {} },
  { id: 'c-3', channel: 'web_chat', detected_intent: 'COMPLAINT', status: 'handover', is_handover: true, created_at: mins(180), business_id: BUSINESS.id, customer_id: null, updated_at: mins(180), confidence: 0.88, metadata: {} },
  { id: 'c-4', channel: 'web_chat', detected_intent: 'PRICE_INQUIRY', status: 'resolved', is_handover: false, created_at: mins(420), business_id: BUSINESS.id, customer_id: null, updated_at: mins(420), confidence: 0.94, metadata: {} },
];

const NOTIFICATIONS = [
  { id: 'n-1', business_id: BUSINESS.id, user_id: USER.id, title: 'New Order Request', message: 'Nike Air Max 90 — RWF 85,000', type: 'info', is_read: false, link: '/dashboard/orders', created_at: mins(10) },
  { id: 'n-2', business_id: BUSINESS.id, user_id: USER.id, title: 'Conversation Escalated', message: 'A customer conversation requires human attention', type: 'warning', is_read: false, link: '/dashboard/conversations/c-3', created_at: mins(35) },
];

const TABLES = {
  memberships: [MEMBERSHIP],
  businesses: [BUSINESS],
  conversations: CONVERSATIONS,
  messages: [],
  customers: [{ id: 'cu-1', business_id: BUSINESS.id, name: 'Jean Bizimana', email: null, phone: '+250 788 000 111', metadata: {}, created_at: mins(300), updated_at: mins(300) }],
  orders: [{ id: 'o-1', business_id: BUSINESS.id, status: 'pending', total_amount: 85000, currency: 'RWF', quantity: 1, notes: 'Air Max 90 · Size 42', created_at: mins(12), updated_at: mins(12), customer_id: null, conversation_id: null, product_id: null, metadata: {} }],
  bookings: [{ id: 'bo-1', business_id: BUSINESS.id, status: 'pending', requested_date: '2026-10-12', requested_time: '14:30:00', notes: 'Cut & style', created_at: mins(48), updated_at: mins(48), customer_id: null, conversation_id: null, service_id: null, metadata: {} }],
  requests: [{ id: 'r-1', business_id: BUSINESS.id, request_type: 'general', title: 'Wholesale pricing question', status: 'pending', priority: 'normal', created_at: mins(90), updated_at: mins(90), customer_id: null, conversation_id: null, metadata: {} }],
  workflows: [{ id: 'w-1', business_id: BUSINESS.id, name: 'Order intake', trigger_type: 'message', trigger_condition: { intent: 'ORDER' }, steps: [], status: 'active', version: 1, is_template: false, template_id: null, description: null, created_at: mins(600), updated_at: mins(600) }],
  products: [{ id: 'p-1', business_id: BUSINESS.id, name: 'Nike Air Max 90', description: 'Iconic sneaker', price: 85000, currency: 'RWF', stock: 12, is_active: true, category_id: null, sku: 'AM90', attributes: {}, image_url: null, created_at: mins(900), updated_at: mins(900) }],
  services: [],
  notifications: NOTIFICATIONS,
  audit_logs: [],
  knowledge_sources: [],
  knowledge_documents: [],
  faqs: [],
};

const COUNTS = {
  conversations: 24, customers: 18, orders: 12, bookings: 7, requests: 3,
  workflows: 5, messages: 141, notifications: 2, products: 26, services: 9,
  audit_logs: 48, businesses: 3, memberships: 4, knowledge_sources: 3,
  knowledge_documents: 21, faqs: 12,
};

function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,HEAD,OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range,Preference-Applied');
}

const server = http.createServer((req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, 'http://127.0.0.1');
  const path = url.pathname;

  // ── Auth API ─────────────────────────────────────────────
  if (path.startsWith('/auth/v1/token')) {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: 4102444800,
        refresh_token: 'mock-refresh-token',
        user: USER,
      }));
    });
    return;
  }
  if (path === '/auth/v1/user') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(USER));
  }
  if (path.startsWith('/auth/v1/logout')) { res.writeHead(204); return res.end(); }
  if (path.startsWith('/auth/v1/signup')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ access_token: 'mock-access-token', token_type: 'bearer', expires_in: 3600, expires_at: 4102444800, refresh_token: 'mock-refresh-token', user: USER }));
  }

  // ── REST API ─────────────────────────────────────────────
  if (path.startsWith('/rest/v1/')) {
    const table = decodeURIComponent(path.slice('/rest/v1/'.length).split('?')[0]).split('.')[0];
    const rows = TABLES[table];
    const count = COUNTS[table] ?? (rows ? rows.length : 0);
    const wantsObject = (req.headers['accept'] || '').includes('vnd.pgrst.object');

    if (req.method === 'HEAD') {
      res.writeHead(204, { 'Content-Range': `0-0/${count}`, 'Content-Type': 'application/json' });
      return res.end();
    }
    if (req.method === 'GET') {
      const data = rows || [];
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Range': `${data.length ? `0-${data.length - 1}` : `*`}/${Math.max(count, data.length)}`,
      });
      return res.end(JSON.stringify(wantsObject ? (data[0] ?? null) : data));
    }
    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        let payload = {};
        try { payload = body ? JSON.parse(body) : {}; } catch {}
        const created = { id: 'new-00000000-0000-0000-0000-000000000000', ...payload };
        const rep = (req.headers['prefer'] || '').includes('return=representation');
        res.writeHead(rep ? 201 : 204, { 'Content-Type': 'application/json' });
        if (!rep) return res.end();
        return res.end(JSON.stringify(wantsObject ? created : [created]));
      });
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'not found', path }));
});

server.listen(54321, '127.0.0.1', () => console.log('mock supabase on 127.0.0.1:54321'));
