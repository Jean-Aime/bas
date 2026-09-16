import type {
  AuditLog,
  Business,
  BusinessHour,
  BusinessLocation,
  BusinessPolicy,
  Conversation,
  Customer,
  FAQ,
  KnowledgeDocument,
  KnowledgeSource,
  Membership,
  Message,
  Notification,
  Product,
  Service,
} from '@/lib/types';

/**
 * Static demo fixtures — the single source of truth for the seeded dataset's
 * shape: which businesses, catalog items, conversations, orders, bookings,
 * requests, workflow runs, knowledge, and admin records exist.
 *
 * Every seeded ID is declared here and must stay stable: dashboard deep links,
 * workflow-execution lookups, and saved demo sessions all reference them.
 * Generative/derived rows (messages, background volume, step logs, timestamps)
 * are built by the functions in demo-data.ts, not listed here.
 *
 * Everything is date-relative ("N days ago") so the dashboard's "last 7 days"
 * charts always show plausible data no matter when the demo runs.
 */

/* ---------------------------------------------------------------------- */
/* Time helpers (shared by all generators)                                  */
/* ---------------------------------------------------------------------- */

/** Day-key (UTC date string) helper for relative timestamps. */
export function isoDaysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date(Date.now() - days * 86_400_000);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** Deterministic RNG (mulberry32) — same seed, same dataset, every run. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convenience bundle passed to generators that stamp created/updated times. */
export interface TimeHelpers {
  isoDaysAgo: typeof isoDaysAgo;
  isoMinutesAgo: typeof isoMinutesAgo;
}

/* ---------------------------------------------------------------------- */
/* Identities                                                               */
/* ---------------------------------------------------------------------- */

export const DEMO_USER_ID = 'demo-user-0000-0000-0000-000000000000';

/* ---------------------------------------------------------------------- */
/* Domain objects (deterministic, no RNG)                                   */
/* ---------------------------------------------------------------------- */

interface DemoBusinessSpec {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  description: string;
  currency: string;
}

const BUSINESS_SPECS: DemoBusinessSpec[] = [
  {
    id: 'biz_urban_threads',
    name: 'Urban Threads',
    type: 'clothing_store',
    city: 'Kigali',
    country: 'Rwanda',
    email: 'info@urbanthreads.rw',
    phone: '+250 788 111 222',
    description: 'Premium clothing store offering stylish apparel for men and women. Sneakers, shirts, jeans, and accessories.',
    currency: 'RWF',
  },
  {
    id: 'biz_salon',
    name: 'Beauty Salon Kigali',
    type: 'salon',
    city: 'Kigali',
    country: 'Rwanda',
    email: 'hello@beautysalon.kigali',
    phone: '+250 788 333 444',
    description: 'Full-service beauty salon offering haircuts, braiding, manicures, and beauty treatments. Appointments recommended.',
    currency: 'RWF',
  },
  {
    id: 'biz_hotel',
    name: 'Lakeview Hotel',
    type: 'hotel',
    city: 'Rubavu',
    country: 'Rwanda',
    email: 'reservations@lakeviewhotel.rw',
    phone: '+250 788 555 666',
    description: 'Boutique hotel with standard and deluxe rooms plus conference facilities, near Lake Kivu.',
    currency: 'USD',
  },
];

const BRAND_COLORS = ['#7c3aed', '#0ea5e9', '#f59e0b'];
const TAGLINES = ['Style for every story.', 'Beauty, every day.', 'Stay by the lake.'];

interface CatalogItem {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock?: number;
  duration_minutes?: number;
  attributes?: Record<string, string>;
}

const PRODUCT_SPECS: CatalogItem[] = [
  { id: 'prod_sneakers', business_id: 'biz_urban_threads', name: 'Black Sneakers', description: 'Premium black leather sneakers, sizes 39-44', price: 45000, currency: 'RWF', stock: 12, attributes: { color: 'black', sizes: '39,40,41,42,43,44' } },
  { id: 'prod_shirt', business_id: 'biz_urban_threads', name: 'White Shirt', description: 'Crisp cotton white shirt, slim fit', price: 25000, currency: 'RWF', stock: 20, attributes: { color: 'white', sizes: 'S,M,L,XL' } },
  { id: 'prod_jeans', business_id: 'biz_urban_threads', name: 'Blue Jeans', description: 'Classic blue denim jeans, straight fit', price: 35000, currency: 'RWF', stock: 15, attributes: { color: 'blue', sizes: '30,32,34,36' } },
  { id: 'prod_jacket', business_id: 'biz_urban_threads', name: 'Denim Jacket', description: 'Timeless denim jacket with button front', price: 55000, currency: 'RWF', stock: 8, attributes: { color: 'blue', sizes: 'S,M,L' } },
  { id: 'prod_dress', business_id: 'biz_urban_threads', name: 'Floral Summer Dress', description: 'Light summer dress with floral print', price: 38000, currency: 'RWF', stock: 10, attributes: { color: 'multicolor', sizes: 'S,M,L' } },
];

const SERVICE_SPECS: CatalogItem[] = [
  { id: 'svc_haircut', business_id: 'biz_salon', name: 'Haircut', description: 'Professional haircut with wash and style', price: 5000, currency: 'RWF', duration_minutes: 30 },
  { id: 'svc_braiding', business_id: 'biz_salon', name: 'Braiding', description: 'Professional hair braiding service', price: 15000, currency: 'RWF', duration_minutes: 120 },
  { id: 'svc_manicure', business_id: 'biz_salon', name: 'Manicure', description: 'Full manicure with polish', price: 7000, currency: 'RWF', duration_minutes: 45 },
  { id: 'svc_facial', business_id: 'biz_salon', name: 'Facial Treatment', description: 'Deep-cleansing facial with massage', price: 12000, currency: 'RWF', duration_minutes: 60 },
  { id: 'svc_standard_room', business_id: 'biz_hotel', name: 'Standard Room', description: 'Comfortable room with queen bed, WiFi, and breakfast included', price: 80, currency: 'USD' },
  { id: 'svc_deluxe_room', business_id: 'biz_hotel', name: 'Deluxe Room', description: 'Spacious room with king bed, lake view, mini bar, and breakfast', price: 150, currency: 'USD' },
  { id: 'svc_conference', business_id: 'biz_hotel', name: 'Conference Room', description: 'Full-day conference room with AV equipment, seating up to 50', price: 300, currency: 'USD' },
];

/* ---------------------------------------------------------------------- */
/* Builders for the deterministic domain objects                            */
/* ---------------------------------------------------------------------- */

/** Three demo businesses: clothing store, salon, hotel. */
export function buildBusinesses(h: TimeHelpers): Business[] {
  return BUSINESS_SPECS.map((b, i) => ({
    id: b.id,
    name: b.name,
    type: b.type,
    country: b.country,
    city: b.city,
    email: b.email,
    phone: b.phone,
    description: b.description,
    website_url: null,
    currency: b.currency,
    timezone: 'Africa/Kigali',
    status: 'active',
    created_at: h.isoDaysAgo(60 - i * 7),
    updated_at: h.isoDaysAgo(1),
  }));
}

/**
 * Demo owner memberships. The platform_admin membership carries a business_id
 * (the real schema allows null there, but the Membership type requires it).
 */
export function buildMemberships(businesses: Business[], h: TimeHelpers): Membership[] {
  return [
    {
      id: 'mem_platform_admin',
      user_id: DEMO_USER_ID,
      business_id: businesses[0].id,
      role: 'platform_admin',
      created_at: h.isoDaysAgo(90),
    },
    ...businesses.map((b, i) => ({
      id: `mem_${i + 1}`,
      user_id: DEMO_USER_ID,
      business_id: b.id,
      role: 'business_owner' as const,
      created_at: h.isoDaysAgo(60 - i * 7),
    })),
  ];
}

export function buildBusinessProfiles(businesses: Business[], h: TimeHelpers): Array<Record<string, unknown>> {
  return businesses.map((b, i) => ({
    id: `prof_${i + 1}`,
    business_id: b.id,
    logo_url: null,
    brand_color: BRAND_COLORS[i],
    tagline: TAGLINES[i],
    about: BUSINESS_SPECS[i].description,
    social_links: {},
    created_at: h.isoDaysAgo(60 - i * 7),
    updated_at: h.isoDaysAgo(1),
  }));
}

export function buildBusinessHours(businesses: Business[]): BusinessHour[] {
  return businesses.flatMap((b, bi) =>
    [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      id: `bh_${bi}_${day}`,
      business_id: b.id,
      day_of_week: day,
      open_time: day === 0 ? null : bi === 2 ? '06:30' : '08:00',
      close_time: day === 0 ? null : bi === 2 ? '22:00' : '18:00',
      is_closed: day === 0,
    }))
  );
}

export function buildBusinessLocations(h: TimeHelpers): BusinessLocation[] {
  return [
    { id: 'loc_1', business_id: 'biz_urban_threads', name: 'Kimironko Flagship', address: 'KG 7 Ave, Kimironko', city: 'Kigali', country: 'Rwanda', phone: '+250 788 111 222', latitude: -1.9355, longitude: 30.1337, created_at: h.isoDaysAgo(55) },
    { id: 'loc_2', business_id: 'biz_salon', name: 'Salon — Kiyovu', address: 'KN 4 Ave, Kiyovu', city: 'Kigali', country: 'Rwanda', phone: '+250 788 333 444', latitude: -1.9499, longitude: 30.0589, created_at: h.isoDaysAgo(50) },
    { id: 'loc_3', business_id: 'biz_hotel', name: 'Lakeview Hotel', address: 'Lake Kivu Shore Road', city: 'Rubavu', country: 'Rwanda', phone: '+250 788 555 666', latitude: -1.6853, longitude: 29.2246, created_at: h.isoDaysAgo(45) },
  ];
}

interface PolicySpec {
  id: string;
  business_id: string;
  title: string;
  content: string;
  category: string;
}

const POLICY_SPECS: PolicySpec[] = [
  { id: 'pol_ut_delivery', business_id: 'biz_urban_threads', title: 'Delivery Policy', content: 'Free delivery for orders above 50,000 RWF within Kigali. Standard delivery fee is 2,000 RWF.', category: 'delivery' },
  { id: 'pol_ut_returns', business_id: 'biz_urban_threads', title: 'Return Policy', content: 'Items can be returned within 14 days of purchase if unused and in original packaging.', category: 'returns' },
  { id: 'pol_salon_cancel', business_id: 'biz_salon', title: 'Cancellation Policy', content: 'Please cancel appointments at least 2 hours in advance. Late cancellations may incur a 50% fee.', category: 'cancellation' },
  { id: 'pol_hotel_booking', business_id: 'biz_hotel', title: 'Booking Policy', content: 'Reservations can be made online or by phone. A deposit may be required for group bookings.', category: 'booking' },
  { id: 'pol_hotel_cancel', business_id: 'biz_hotel', title: 'Cancellation Policy', content: 'Free cancellation up to 48 hours before check-in. Within 48 hours, one night will be charged.', category: 'cancellation' },
];

export function buildBusinessPolicies(h: TimeHelpers): BusinessPolicy[] {
  return POLICY_SPECS.map((p) => ({
    id: p.id,
    business_id: p.business_id,
    title: p.title,
    content: p.content,
    category: p.category,
    created_at: h.isoDaysAgo(58),
    updated_at: h.isoDaysAgo(2),
  }));
}

export function buildBusinessRules(h: TimeHelpers): Array<Record<string, unknown>> {
  return [
    { id: 'rule_1', business_id: 'biz_urban_threads', name: 'VIP customers get free delivery', description: 'Orders above 50,000 RWF ship free', rule_type: 'pricing', condition: { field: 'order_total', op: 'gt', value: 50000 }, action: { type: 'free_delivery' }, is_active: true, created_at: h.isoDaysAgo(40), updated_at: h.isoDaysAgo(3) },
    { id: 'rule_2', business_id: 'biz_salon', name: 'Escalate complaints to manager', description: 'Any complaint intent goes straight to the manager', rule_type: 'escalation', condition: { intent: 'COMPLAINT' }, action: { type: 'handover' }, is_active: true, created_at: h.isoDaysAgo(38), updated_at: h.isoDaysAgo(3) },
  ];
}

export function buildProductCategories(h: TimeHelpers): Array<Record<string, unknown>> {
  return [
    { id: 'pcat_1', business_id: 'biz_urban_threads', name: 'Footwear', description: 'Sneakers and shoes', created_at: h.isoDaysAgo(55) },
    { id: 'pcat_2', business_id: 'biz_urban_threads', name: 'Apparel', description: 'Shirts, jeans, jackets, dresses', created_at: h.isoDaysAgo(55) },
  ];
}

export function buildServiceCategories(h: TimeHelpers): Array<Record<string, unknown>> {
  return [
    { id: 'scat_1', business_id: 'biz_salon', name: 'Hair', description: 'Cuts and braiding', created_at: h.isoDaysAgo(50) },
    { id: 'scat_2', business_id: 'biz_salon', name: 'Beauty', description: 'Nails and skin care', created_at: h.isoDaysAgo(50) },
  ];
}

export function buildProducts(h: TimeHelpers): Product[] {
  return PRODUCT_SPECS.map((p, i) => ({
    id: p.id,
    business_id: p.business_id,
    category_id: i < 1 ? 'pcat_1' : 'pcat_2',
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    sku: `UT-${1000 + i}`,
    attributes: p.attributes || {},
    stock: p.stock ?? 0,
    is_active: true,
    image_url: null,
    created_at: h.isoDaysAgo(54),
    updated_at: h.isoDaysAgo(1),
  }));
}

export function buildServices(h: TimeHelpers): Service[] {
  return SERVICE_SPECS.map((s, i) => ({
    id: s.id,
    business_id: s.business_id,
    category_id: s.business_id === 'biz_salon' ? (i < 2 ? 'scat_1' : 'scat_2') : null,
    name: s.name,
    description: s.description,
    price: s.price,
    currency: s.currency,
    duration_minutes: s.duration_minutes ?? null,
    is_active: true,
    created_at: h.isoDaysAgo(49),
    updated_at: h.isoDaysAgo(1),
  }));
}

/** Background message volume shape: weekday-heavy with a gentle upward trend. */
export const BACKGROUND_MESSAGE_BASE = [7, 5.5, 9]; // per-business hourly base volume

/* ---------------------------------------------------------------------- */
/* CRM specs (conversations, orders, bookings, requests)                    */
/* ---------------------------------------------------------------------- */

interface FaqSpec {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_SPECS: FaqSpec[] = [
  { id: 'faq_ut_delivery', business_id: 'biz_urban_threads', question: 'Do you offer delivery?', answer: 'Yes, we offer delivery within Kigali for 2,000 RWF. Orders are delivered within 1-2 business days.', category: 'delivery' },
  { id: 'faq_ut_returns', business_id: 'biz_urban_threads', question: 'What is your return policy?', answer: 'Items can be returned within 14 days if unused and in original packaging.', category: 'returns' },
  { id: 'faq_ut_stores', business_id: 'biz_urban_threads', question: 'Do you have physical stores?', answer: 'Yes, we are located in Kimironko, Kigali. Open Monday to Saturday 8am-6pm.', category: 'general' },
  { id: 'faq_salon_appt', business_id: 'biz_salon', question: 'Do I need an appointment?', answer: 'Appointments are recommended but walk-ins are welcome. Call us at +250 788 333 444 to book.', category: 'appointments' },
  { id: 'faq_salon_hours', business_id: 'biz_salon', question: 'What are your hours?', answer: 'We are open Monday to Saturday, 8:00 AM to 6:00 PM. Closed on Sundays.', category: 'hours' },
  { id: 'faq_hotel_breakfast', business_id: 'biz_hotel', question: 'Is breakfast included?', answer: 'Yes, breakfast is included with all room bookings. Continental breakfast from 6:30 AM to 10:00 AM.', category: 'amenities' },
  { id: 'faq_hotel_parking', business_id: 'biz_hotel', question: 'Do you have parking?', answer: 'Yes, we offer free parking for all hotel guests.', category: 'amenities' },
  { id: 'faq_hotel_checkin', business_id: 'biz_hotel', question: 'What is the check-in time?', answer: 'Check-in is from 2:00 PM. Check-out is by 11:00 AM. Early check-in is subject to availability.', category: 'general' },
];

export interface CustomerSpec {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone: string;
}

const CUSTOMER_SPECS: CustomerSpec[] = [
  { id: 'cust_01', business_id: 'biz_urban_threads', name: 'Aline Uwase', email: 'aline.uwase@example.com', phone: '+250 788 200 101' },
  { id: 'cust_02', business_id: 'biz_urban_threads', name: 'Eric Nkusi', email: 'eric.nkusi@example.com', phone: '+250 788 200 102' },
  { id: 'cust_03', business_id: 'biz_urban_threads', name: 'Claudine Ingabire', email: 'claudine.ingabire@example.com', phone: '+250 788 200 103' },
  { id: 'cust_04', business_id: 'biz_urban_threads', name: 'Jean-Paul Habimana', email: 'jp.habimana@example.com', phone: '+250 788 200 104' },
  { id: 'cust_05', business_id: 'biz_urban_threads', name: 'Diane Mukamana', email: 'diane.mukamana@example.com', phone: '+250 788 200 105' },
  { id: 'cust_11', business_id: 'biz_salon', name: 'Sandrine Umutoni', email: 'sandrine.umutoni@example.com', phone: '+250 788 300 201' },
  { id: 'cust_12', business_id: 'biz_salon', name: 'Grace Nyirahabimana', email: 'grace.nyira@example.com', phone: '+250 788 300 202' },
  { id: 'cust_13', business_id: 'biz_salon', name: 'Olivier Nshimiyimana', email: 'olivier.nshimi@example.com', phone: '+250 788 300 203' },
  { id: 'cust_14', business_id: 'biz_salon', name: 'Josiane Mukandayisenga', email: 'josiane.mukanda@example.com', phone: '+250 788 300 204' },
  { id: 'cust_21', business_id: 'biz_hotel', name: 'Daniel Kagabo', email: 'daniel.kagabo@example.com', phone: '+250 788 400 301' },
  { id: 'cust_22', business_id: 'biz_hotel', name: 'Sarah Williams', email: 'sarah.williams@example.com', phone: '+44 7700 900 123' },
  { id: 'cust_23', business_id: 'biz_hotel', name: 'Aimable Rwigema', email: 'aimable.rwigema@example.com', phone: '+250 788 400 303' },
];

export interface ConversationSpec {
  id: string;
  business_id: string;
  customer_id: string;
  channel: string;
  status: string;
  is_handover: boolean;
  detected_intent: string;
  confidence: number;
  createdDaysAgo: number;
  /** Customer → assistant message pairs, plus optional staff message. */
  messages: Array<{ sender: 'customer' | 'assistant' | 'staff'; content: string }>;
}

const CONVERSATION_SPECS: ConversationSpec[] = [
  {
    id: 'conv_001', business_id: 'biz_urban_threads', customer_id: 'cust_01', channel: 'web_chat', status: 'resolved', is_handover: false,
    detected_intent: 'ORDER', confidence: 0.92, createdDaysAgo: 6,
    messages: [
      { sender: 'customer', content: 'Hi, do you have the black sneakers in size 42?' },
      { sender: 'assistant', content: 'Yes! Black Sneakers are available in size 42 — RWF 45,000. We have 12 pairs in stock. Would you like to place an order?' },
      { sender: 'customer', content: 'Yes please, order one pair.' },
      { sender: 'assistant', content: 'Great — I\'ve submitted your order request for Black Sneakers (size 42). The Urban Threads team will confirm delivery details shortly. Anything else I can help with?' },
    ],
  },
  {
    id: 'conv_002', business_id: 'biz_urban_threads', customer_id: 'cust_02', channel: 'web_chat', status: 'resolved', is_handover: false,
    detected_intent: 'DELIVERY', confidence: 0.88, createdDaysAgo: 5,
    messages: [
      { sender: 'customer', content: 'How much is delivery to Nyamirambo?' },
      { sender: 'assistant', content: 'Delivery within Kigali is 2,000 RWF, and free for orders above 50,000 RWF. Orders arrive within 1-2 business days.' },
      { sender: 'customer', content: 'Perfect, thanks!' },
      { sender: 'assistant', content: 'You\'re welcome! Let me know if you\'d like help placing an order.' },
    ],
  },
  {
    id: 'conv_003', business_id: 'biz_urban_threads', customer_id: 'cust_03', channel: 'web_chat', status: 'resolved', is_handover: true,
    detected_intent: 'RETURN', confidence: 0.81, createdDaysAgo: 4,
    messages: [
      { sender: 'customer', content: 'I need to return a shirt I bought last week, it doesn\'t fit.' },
      { sender: 'assistant', content: 'I\'m sorry to hear the fit didn\'t work out. I\'m connecting you with the Urban Threads team who can process the return right away.' },
      { sender: 'staff', content: 'Hello Claudine, this is Diane from Urban Threads. No problem at all — you can return it within 14 days. Can you bring the receipt?' },
      { sender: 'customer', content: 'Yes, I have it. I\'ll come by tomorrow.' },
    ],
  },
  {
    id: 'conv_004', business_id: 'biz_urban_threads', customer_id: 'cust_04', channel: 'web_chat', status: 'resolved', is_handover: false,
    detected_intent: 'PRICE_INQUIRY', confidence: 0.9, createdDaysAgo: 3,
    messages: [
      { sender: 'customer', content: 'How much are the blue jeans?' },
      { sender: 'assistant', content: 'Blue Jeans are RWF 35,000 — classic straight-fit denim, sizes 30-36. We have 15 pairs in stock.' },
      { sender: 'customer', content: 'Do they come in size 34?' },
      { sender: 'assistant', content: 'Yes, size 34 is available. Would you like to order a pair?' },
    ],
  },
  {
    id: 'conv_005', business_id: 'biz_urban_threads', customer_id: 'cust_05', channel: 'web_chat', status: 'active', is_handover: false,
    detected_intent: 'PRODUCT_INQUIRY', confidence: 0.76, createdDaysAgo: 0,
    messages: [
      { sender: 'customer', content: 'Do you have any summer dresses in stock?' },
      { sender: 'assistant', content: 'Yes — the Floral Summer Dress is RWF 38,000, available in sizes S, M, and L with 10 pieces in stock. Would you like more details?' },
    ],
  },
  {
    id: 'conv_006', business_id: 'biz_urban_threads', customer_id: 'cust_01', channel: 'web_chat', status: 'active', is_handover: false,
    detected_intent: 'AVAILABILITY', confidence: 0.72, createdDaysAgo: 0,
    messages: [
      { sender: 'customer', content: 'Are you open today?' },
      { sender: 'assistant', content: 'We\'re open Monday to Saturday, 8:00 AM to 6:00 PM. Today we\'re open until 6 PM — come by!' },
    ],
  },
  {
    id: 'conv_101', business_id: 'biz_salon', customer_id: 'cust_11', channel: 'web_chat', status: 'resolved', is_handover: false,
    detected_intent: 'BOOKING', confidence: 0.94, createdDaysAgo: 5,
    messages: [
      { sender: 'customer', content: 'I\'d like to book braiding for Saturday morning.' },
      { sender: 'assistant', content: 'Braiding is RWF 15,000 and takes about 2 hours. I\'ve submitted a booking request for Saturday morning — the salon will confirm the exact time shortly.' },
      { sender: 'customer', content: 'Thank you!' },
    ],
  },
  {
    id: 'conv_102', business_id: 'biz_salon', customer_id: 'cust_12', channel: 'web_chat', status: 'resolved', is_handover: false,
    detected_intent: 'PRICE_INQUIRY', confidence: 0.87, createdDaysAgo: 3,
    messages: [
      { sender: 'customer', content: 'How much is a manicure?' },
      { sender: 'assistant', content: 'A full manicure with polish is RWF 7,000 and takes about 45 minutes. Would you like to book one?' },
    ],
  },
  {
    id: 'conv_103', business_id: 'biz_salon', customer_id: 'cust_13', channel: 'web_chat', status: 'handover', is_handover: true,
    detected_intent: 'COMPLAINT', confidence: 0.85, createdDaysAgo: 1,
    messages: [
      { sender: 'customer', content: 'This is terrible — I waited 40 minutes past my appointment time yesterday.' },
      { sender: 'assistant', content: 'I\'m really sorry to hear that. I\'m connecting you with a team member who can help resolve this right away.' },
      { sender: 'staff', content: 'Hello Olivier, Grace here — I sincerely apologize for the wait. I\'d like to make it up to you with a complimentary treatment on your next visit.' },
    ],
  },
  {
    id: 'conv_104', business_id: 'biz_salon', customer_id: 'cust_14', channel: 'web_chat', status: 'active', is_handover: false,
    detected_intent: 'APPOINTMENT', confidence: 0.83, createdDaysAgo: 0,
    messages: [
      { sender: 'customer', content: 'Can I get a facial this week? When do you have slots?' },
      { sender: 'assistant', content: 'The Facial Treatment is RWF 12,000 (60 min). Submit your preferred day and time and the salon will confirm availability right away.' },
    ],
  },
  {
    id: 'conv_201', business_id: 'biz_hotel', customer_id: 'cust_21', channel: 'web_chat', status: 'resolved', is_handover: false,
    detected_intent: 'BOOKING', confidence: 0.95, createdDaysAgo: 4,
    messages: [
      { sender: 'customer', content: 'Do you have a deluxe room for two nights next weekend?' },
      { sender: 'assistant', content: 'The Deluxe Room is $150/night with king bed, lake view, mini bar, and breakfast included. I\'ve submitted a booking request for two nights — our team will confirm shortly.' },
      { sender: 'customer', content: 'Great, waiting for confirmation.' },
    ],
  },
  {
    id: 'conv_202', business_id: 'biz_hotel', customer_id: 'cust_22', channel: 'web_chat', status: 'resolved', is_handover: false,
    detected_intent: 'FAQ', confidence: 0.91, createdDaysAgo: 2,
    messages: [
      { sender: 'customer', content: 'Is breakfast included in the room price?' },
      { sender: 'assistant', content: 'Yes — a continental breakfast from 6:30 AM to 10:00 AM is included with all room bookings.' },
    ],
  },
  {
    id: 'conv_203', business_id: 'biz_hotel', customer_id: 'cust_23', channel: 'web_chat', status: 'active', is_handover: false,
    detected_intent: 'SERVICE_INQUIRY', confidence: 0.79, createdDaysAgo: 0,
    messages: [
      { sender: 'customer', content: 'We\'re planning a workshop for 30 people — what conference facilities do you have?' },
      { sender: 'assistant', content: 'Our Conference Room seats up to 50 with full-day AV equipment at $300. Would you like me to submit a booking request for your workshop?' },
    ],
  },
];

interface OrderSpec {
  id: string;
  business_id: string;
  customer_id: string;
  conversation_id: string;
  product_id: string;
  quantity: number;
  status: string;
  createdDaysAgo: number;
}

const ORDER_SPECS: OrderSpec[] = [
  { id: 'ord_001', business_id: 'biz_urban_threads', customer_id: 'cust_01', conversation_id: 'conv_001', product_id: 'prod_sneakers', quantity: 1, status: 'completed', createdDaysAgo: 6 },
  { id: 'ord_002', business_id: 'biz_urban_threads', customer_id: 'cust_02', conversation_id: 'conv_002', product_id: 'prod_jeans', quantity: 2, status: 'completed', createdDaysAgo: 5 },
  { id: 'ord_003', business_id: 'biz_urban_threads', customer_id: 'cust_03', conversation_id: 'conv_003', product_id: 'prod_shirt', quantity: 1, status: 'cancelled', createdDaysAgo: 4 },
  { id: 'ord_004', business_id: 'biz_urban_threads', customer_id: 'cust_04', conversation_id: 'conv_004', product_id: 'prod_jeans', quantity: 1, status: 'confirmed', createdDaysAgo: 3 },
  { id: 'ord_005', business_id: 'biz_urban_threads', customer_id: 'cust_05', conversation_id: 'conv_005', product_id: 'prod_dress', quantity: 1, status: 'pending', createdDaysAgo: 1 },
  { id: 'ord_006', business_id: 'biz_urban_threads', customer_id: 'cust_01', conversation_id: 'conv_006', product_id: 'prod_jacket', quantity: 1, status: 'pending', createdDaysAgo: 0 },
];

interface BookingSpec {
  id: string;
  business_id: string;
  customer_id: string;
  conversation_id: string;
  service_id: string;
  status: string;
  inDays: number; // days from today (negative = past)
  time: string;
  createdDaysAgo: number;
}

const BOOKING_SPECS: BookingSpec[] = [
  { id: 'bkg_001', business_id: 'biz_salon', customer_id: 'cust_11', conversation_id: 'conv_101', service_id: 'svc_braiding', status: 'completed', inDays: -2, time: '09:00', createdDaysAgo: 5 },
  { id: 'bkg_002', business_id: 'biz_salon', customer_id: 'cust_12', conversation_id: 'conv_102', service_id: 'svc_manicure', status: 'confirmed', inDays: 1, time: '14:00', createdDaysAgo: 2 },
  { id: 'bkg_003', business_id: 'biz_salon', customer_id: 'cust_13', conversation_id: 'conv_103', service_id: 'svc_haircut', status: 'cancelled', inDays: -1, time: '11:00', createdDaysAgo: 1 },
  { id: 'bkg_004', business_id: 'biz_salon', customer_id: 'cust_14', conversation_id: 'conv_104', service_id: 'svc_facial', status: 'pending', inDays: 2, time: '15:30', createdDaysAgo: 0 },
  { id: 'bkg_005', business_id: 'biz_hotel', customer_id: 'cust_21', conversation_id: 'conv_201', service_id: 'svc_deluxe_room', status: 'confirmed', inDays: 5, time: '14:00', createdDaysAgo: 4 },
  { id: 'bkg_006', business_id: 'biz_hotel', customer_id: 'cust_23', conversation_id: 'conv_203', service_id: 'svc_conference', status: 'pending', inDays: 9, time: '08:00', createdDaysAgo: 0 },
];

interface RequestSpec {
  id: string;
  business_id: string;
  customer_id: string;
  conversation_id: string;
  request_type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdDaysAgo: number;
}

const REQUEST_SPECS: RequestSpec[] = [
  { id: 'req_001', business_id: 'biz_urban_threads', customer_id: 'cust_03', conversation_id: 'conv_003', request_type: 'return', title: 'Return request — White Shirt', description: 'Customer wants to return a shirt that doesn\'t fit; has receipt.', status: 'in_progress', priority: 'normal', createdDaysAgo: 4 },
  { id: 'req_002', business_id: 'biz_urban_threads', customer_id: 'cust_05', conversation_id: 'conv_005', request_type: 'availability', title: 'Restock check — Floral Summer Dress', description: 'Customer asked for availability; verify restock for size L.', status: 'pending', priority: 'low', createdDaysAgo: 1 },
  { id: 'req_003', business_id: 'biz_salon', customer_id: 'cust_13', conversation_id: 'conv_103', request_type: 'complaint', title: 'Service complaint — long wait', description: 'Customer waited 40 minutes past appointment. Manager follow-up needed.', status: 'in_progress', priority: 'high', createdDaysAgo: 1 },
  { id: 'req_004', business_id: 'biz_salon', customer_id: 'cust_14', conversation_id: 'conv_104', request_type: 'appointment', title: 'Facial appointment — confirm slot', description: 'Confirm facial treatment slot for this week.', status: 'pending', priority: 'normal', createdDaysAgo: 0 },
  { id: 'req_005', business_id: 'biz_hotel', customer_id: 'cust_23', conversation_id: 'conv_203', request_type: 'event', title: 'Workshop for 30 people', description: 'Conference room booking for a 30-person workshop; quote requested.', status: 'pending', priority: 'normal', createdDaysAgo: 0 },
  { id: 'req_006', business_id: 'biz_hotel', customer_id: 'cust_21', conversation_id: 'conv_201', request_type: 'general', title: 'Airport pickup inquiry', description: 'Guest asked whether airport transfer can be arranged.', status: 'resolved', priority: 'low', createdDaysAgo: 4 },
];

interface ExecutionSpec {
  id: string;
  business_id: string;
  workflowTplId: string;
  conversation_id: string;
  status: 'completed' | 'failed' | 'running';
  triggerMessage: string;
  daysAgo: number;
}

const EXECUTION_SPECS: ExecutionSpec[] = [
  { id: 'exec_001', business_id: 'biz_urban_threads', workflowTplId: 'tpl_order_request', conversation_id: 'conv_001', status: 'completed', triggerMessage: 'Hi, do you have the black sneakers in size 42?', daysAgo: 6 },
  { id: 'exec_002', business_id: 'biz_urban_threads', workflowTplId: 'tpl_product_inquiry', conversation_id: 'conv_004', status: 'completed', triggerMessage: 'How much are the blue jeans?', daysAgo: 3 },
  { id: 'exec_003', business_id: 'biz_urban_threads', workflowTplId: 'tpl_human_handover', conversation_id: 'conv_003', status: 'completed', triggerMessage: 'I need to return a shirt I bought last week, it doesn\'t fit.', daysAgo: 4 },
  { id: 'exec_004', business_id: 'biz_urban_threads', workflowTplId: 'tpl_faq', conversation_id: 'conv_006', status: 'completed', triggerMessage: 'Are you open today?', daysAgo: 0 },
  { id: 'exec_005', business_id: 'biz_urban_threads', workflowTplId: 'tpl_order_request', conversation_id: 'conv_005', status: 'failed', triggerMessage: 'Do you have any summer dresses in stock?', daysAgo: 0 },
  { id: 'exec_101', business_id: 'biz_salon', workflowTplId: 'tpl_booking_request', conversation_id: 'conv_101', status: 'completed', triggerMessage: 'I\'d like to book braiding for Saturday morning.', daysAgo: 5 },
  { id: 'exec_102', business_id: 'biz_salon', workflowTplId: 'tpl_service_inquiry', conversation_id: 'conv_102', status: 'completed', triggerMessage: 'How much is a manicure?', daysAgo: 3 },
  { id: 'exec_103', business_id: 'biz_salon', workflowTplId: 'tpl_human_handover', conversation_id: 'conv_103', status: 'completed', triggerMessage: 'This is terrible — I waited 40 minutes past my appointment time yesterday.', daysAgo: 1 },
  { id: 'exec_104', business_id: 'biz_salon', workflowTplId: 'wf_salon_appt', conversation_id: 'conv_104', status: 'running', triggerMessage: 'Can I get a facial this week? When do you have slots?', daysAgo: 0 },
  { id: 'exec_201', business_id: 'biz_hotel', workflowTplId: 'tpl_booking_request', conversation_id: 'conv_201', status: 'completed', triggerMessage: 'Do you have a deluxe room for two nights next weekend?', daysAgo: 4 },
  { id: 'exec_202', business_id: 'biz_hotel', workflowTplId: 'tpl_faq', conversation_id: 'conv_202', status: 'completed', triggerMessage: 'Is breakfast included in the room price?', daysAgo: 2 },
  { id: 'exec_203', business_id: 'biz_hotel', workflowTplId: 'tpl_service_inquiry', conversation_id: 'conv_203', status: 'running', triggerMessage: 'We\'re planning a workshop for 30 people — what conference facilities do you have?', daysAgo: 0 },
];

export {
  FAQ_SPECS,
  CUSTOMER_SPECS,
  CONVERSATION_SPECS,
  ORDER_SPECS,
  BOOKING_SPECS,
  REQUEST_SPECS,
  EXECUTION_SPECS,
};

/* ---------------------------------------------------------------------- */
/* Knowledge specs                                                          */
/* ---------------------------------------------------------------------- */

interface KnowledgeDocSpec {
  id: string;
  business_id: string;
  source_id: string;
  title: string;
  content: string;
  doc_type: string;
}

const KNOWLEDGE_DOC_SPECS: KnowledgeDocSpec[] = [
  {
    id: 'kdoc_ut_1', business_id: 'biz_urban_threads', source_id: 'ksrc_ut', title: 'Store Overview',
    content: 'Urban Threads is a premium clothing store in Kimironko, Kigali. We stock sneakers, shirts, jeans, jackets, and dresses for men and women. Open Monday to Saturday, 8:00-18:00. Delivery across Kigali within 1-2 business days for 2,000 RWF (free above 50,000 RWF). Returns accepted within 14 days with receipt.',
    doc_type: 'general',
  },
  {
    id: 'kdoc_ut_2', business_id: 'biz_urban_threads', source_id: 'ksrc_ut', title: 'Sizing Guide',
    content: 'Shoes: EU sizes 39-44; size up for wide feet. Shirts: S (chest 36), M (40), L (44), XL (48). Jeans: waist 30-36, straight fit runs true to size. Jackets and dresses follow the same shirt sizing chart.',
    doc_type: 'faq',
  },
  {
    id: 'kdoc_salon_1', business_id: 'biz_salon', source_id: 'ksrc_salon', title: 'Salon Services Overview',
    content: 'Beauty Salon Kigali offers haircuts (30 min), braiding (2 h), manicures (45 min), and facial treatments (60 min). Walk-ins welcome but appointments recommended. Closed Sundays. Cancellations accepted up to 2 hours before an appointment.',
    doc_type: 'general',
  },
  {
    id: 'kdoc_hotel_1', business_id: 'biz_hotel', source_id: 'ksrc_hotel', title: 'Hotel Information',
    content: 'Lakeview Hotel is a boutique hotel near Lake Kivu in Rubavu with 24 rooms: standard ($80) and deluxe ($150) including breakfast, plus a conference room seating 50 ($300/day) with AV equipment. Check-in from 2:00 PM, check-out by 11:00 AM. Free parking and free WiFi. Free cancellation up to 48 hours before check-in.',
    doc_type: 'general',
  },
];

export { KNOWLEDGE_DOC_SPECS };

/* ---------------------------------------------------------------------- */
/* Deterministic builders for the remaining fixtures                        */
/* ---------------------------------------------------------------------- */

/** Three manual knowledge sources, one per business. */
export function buildKnowledgeSources(h: TimeHelpers): KnowledgeSource[] {
  return [
    { id: 'ksrc_ut', business_id: 'biz_urban_threads', source_type: 'manual', title: 'Urban Threads Handbook', url: null, content: null, status: 'active', metadata: {}, created_at: h.isoDaysAgo(45), updated_at: h.isoDaysAgo(3) },
    { id: 'ksrc_salon', business_id: 'biz_salon', source_type: 'manual', title: 'Salon Service Notes', url: null, content: null, status: 'active', metadata: {}, created_at: h.isoDaysAgo(44), updated_at: h.isoDaysAgo(3) },
    { id: 'ksrc_hotel', business_id: 'biz_hotel', source_type: 'manual', title: 'Hotel Guest Guide', url: null, content: null, status: 'active', metadata: {}, created_at: h.isoDaysAgo(43), updated_at: h.isoDaysAgo(3) },
  ];
}

export function buildKnowledgeDocuments(h: TimeHelpers): KnowledgeDocument[] {
  return KNOWLEDGE_DOC_SPECS.map((d) => ({
    id: d.id,
    business_id: d.business_id,
    source_id: d.source_id,
    title: d.title,
    content: d.content,
    doc_type: d.doc_type,
    metadata: {},
    created_at: h.isoDaysAgo(43),
  }));
}

export function buildFaqs(h: TimeHelpers): FAQ[] {
  return FAQ_SPECS.map((f) => ({
    id: f.id,
    business_id: f.business_id,
    question: f.question,
    answer: f.answer,
    category: f.category,
    is_published: true,
    created_at: h.isoDaysAgo(48),
    updated_at: h.isoDaysAgo(2),
  }));
}

export function buildCustomers(h: TimeHelpers): Customer[] {
  return CUSTOMER_SPECS.map((c, i) => ({
    id: c.id,
    business_id: c.business_id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    metadata: { source: 'web_chat' },
    created_at: h.isoDaysAgo(40 - i * 2),
    updated_at: h.isoDaysAgo(1),
  }));
}

/** Expands a conversation spec into the conversation row and its message thread. */
export function buildConversationMessages(
  spec: ConversationSpec,
  conversationIndex: number,
  h: TimeHelpers
): { conversation: Conversation; messages: Message[] } {
  const ci = conversationIndex;
  const created = spec.createdDaysAgo === 0
    ? h.isoMinutesAgo(120 + ci * 15)
    : h.isoDaysAgo(spec.createdDaysAgo, 9 + (ci % 8));
  const updatedAt = spec.createdDaysAgo === 0
    ? h.isoMinutesAgo(5 + ci * 8)
    : h.isoDaysAgo(spec.createdDaysAgo, 11 + (ci % 6));

  const conversation: Conversation = {
    id: spec.id,
    business_id: spec.business_id,
    customer_id: spec.customer_id,
    channel: spec.channel,
    status: spec.status,
    assigned_to: spec.is_handover ? DEMO_USER_ID : null,
    is_handover: spec.is_handover,
    detected_intent: spec.detected_intent,
    confidence: spec.confidence,
    metadata: {},
    created_at: created,
    updated_at: updatedAt,
  };

  const span = Math.max(1, Math.floor((new Date(updatedAt).getTime() - new Date(created).getTime()) / 60000));
  const messages = spec.messages.map((m, mi) => ({
    id: `msg_${spec.id}_${mi}`,
    conversation_id: spec.id,
    business_id: spec.business_id,
    sender_type: m.sender,
    content: m.content,
    intent: mi === 0 ? spec.detected_intent : null,
    confidence: mi === 0 ? spec.confidence : null,
    metadata: {},
    created_at: new Date(new Date(created).getTime() + Math.floor((span / spec.messages.length) * mi) * 60_000).toISOString(),
  }));

  return { conversation, messages };
}

export function buildNotifications(h: TimeHelpers): Notification[] {
  return [
    { id: 'notif_1', business_id: 'biz_urban_threads', user_id: DEMO_USER_ID, title: 'New order request', message: 'Aline Uwase requested 1× Black Sneakers (RWF 45,000).', type: 'order', is_read: false, link: '/dashboard/orders', created_at: h.isoMinutesAgo(35) },
    { id: 'notif_2', business_id: 'biz_salon', user_id: DEMO_USER_ID, title: 'Complaint escalated', message: 'Olivier Nshimiyimana reported a long wait — manager follow-up required.', type: 'handover', is_read: false, link: '/dashboard/requests', created_at: h.isoMinutesAgo(95) },
    { id: 'notif_3', business_id: 'biz_hotel', user_id: DEMO_USER_ID, title: 'Booking request', message: 'Daniel Kagabo requested the Deluxe Room for two nights.', type: 'booking', is_read: false, link: '/dashboard/bookings', created_at: h.isoMinutesAgo(150) },
    { id: 'notif_4', business_id: 'biz_urban_threads', user_id: DEMO_USER_ID, title: 'Workflow failed', message: 'Order Request could not complete — knowledge search returned no results.', type: 'workflow', is_read: true, link: '/dashboard/automation', created_at: h.isoMinutesAgo(240) },
    { id: 'notif_5', business_id: 'biz_salon', user_id: DEMO_USER_ID, title: 'Booking confirmed', message: 'Grace Nyirahabimana confirmed a manicure for tomorrow at 2:00 PM.', type: 'booking', is_read: true, link: '/dashboard/bookings', created_at: h.isoDaysAgo(1, 16) },
    { id: 'notif_6', business_id: 'biz_hotel', user_id: DEMO_USER_ID, title: 'Knowledge imported', message: 'Hotel Guest Guide imported successfully — 1 document added.', type: 'knowledge', is_read: true, link: '/dashboard/knowledge', created_at: h.isoDaysAgo(2, 11) },
    { id: 'notif_7', business_id: 'biz_urban_threads', user_id: DEMO_USER_ID, title: 'Weekly summary ready', message: 'Your automation report for last week is available.', type: 'system', is_read: true, link: '/dashboard/analytics', created_at: h.isoDaysAgo(3, 8) },
  ];
}

export function buildAuditLogs(h: TimeHelpers): AuditLog[] {
  return [
    { id: 'audit_1', business_id: 'biz_urban_threads', user_id: DEMO_USER_ID, action: 'workflow.created', entity_type: 'workflow', entity_id: 'wf_0_4', details: { name: 'Order Request' }, created_at: h.isoDaysAgo(6) },
    { id: 'audit_2', business_id: 'biz_urban_threads', user_id: DEMO_USER_ID, action: 'chat.message_processed', entity_type: 'conversation', entity_id: 'conv_001', details: { intent: 'ORDER', confidence: 0.92 }, created_at: h.isoDaysAgo(6) },
    { id: 'audit_3', business_id: 'biz_salon', user_id: DEMO_USER_ID, action: 'knowledge.imported', entity_type: 'knowledge_source', entity_id: 'ksrc_salon', details: { title: 'Salon Service Notes' }, created_at: h.isoDaysAgo(4) },
    { id: 'audit_4', business_id: 'biz_hotel', user_id: null, action: 'chat.message_processed', entity_type: 'conversation', entity_id: 'conv_201', details: { intent: 'BOOKING', confidence: 0.95 }, created_at: h.isoDaysAgo(4) },
    { id: 'audit_5', business_id: 'biz_salon', user_id: DEMO_USER_ID, action: 'team.member_added', entity_type: 'membership', entity_id: 'mem_2', details: { role: 'staff' }, created_at: h.isoDaysAgo(2) },
  ];
}
