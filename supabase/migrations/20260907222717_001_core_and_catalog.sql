/*
# BAS Core Schema — Identity, Tenancy, Business Configuration, and Catalog

## Overview
This migration creates the foundational schema for the Business Automation System (BAS).
It establishes multi-tenancy, business configuration, and the product/service catalog.

## 1. New Tables
### Identity & Tenancy
- `businesses` — Tenant organizations. Each business is an independent tenant.
- `memberships` — Links users to businesses with roles.

### Business Configuration
- `business_profiles`, `business_hours`, `business_locations`, `business_policies`, `business_rules`

### Catalog
- `product_categories`, `products`, `service_categories`, `services`

### Knowledge
- `faqs`

## 2. Security
- RLS enabled on ALL tables.
- Tenant tables scoped via `business_id` using `is_business_member()` helper.
- Memberships are owner-scoped.

## 3. Helper Functions
- `is_business_member(business_id uuid)` — Returns true if current user is a member of the given business.
*/

-- ============================================================
-- CREATE ALL TABLES FIRST (no policies yet)
-- ============================================================

CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  country text,
  city text,
  email text,
  phone text,
  description text,
  website_url text,
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'UTC',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, business_id)
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  logo_url text,
  brand_color text,
  tagline text,
  about text,
  social_links jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time,
  close_time time,
  is_closed boolean NOT NULL DEFAULT false,
  UNIQUE(business_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS business_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  city text,
  country text,
  phone text,
  latitude float8,
  longitude float8,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL DEFAULT 'general',
  condition jsonb DEFAULT '{}',
  action jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  sku text,
  attributes jsonb DEFAULT '{}',
  stock int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid REFERENCES service_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  duration_minutes int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- HELPER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION is_business_member(target_business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.business_id = target_business_id
    AND memberships.user_id = auth.uid()
  );
$$;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: BUSINESSES
-- ============================================================
DROP POLICY IF EXISTS "select_member_businesses" ON businesses;
CREATE POLICY "select_member_businesses" ON businesses FOR SELECT
  TO authenticated USING (is_business_member(id));

DROP POLICY IF EXISTS "insert_businesses" ON businesses;
CREATE POLICY "insert_businesses" ON businesses FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_member_businesses" ON businesses;
CREATE POLICY "update_member_businesses" ON businesses FOR UPDATE
  TO authenticated USING (is_business_member(id)) WITH CHECK (is_business_member(id));

DROP POLICY IF EXISTS "delete_member_businesses" ON businesses;
CREATE POLICY "delete_member_businesses" ON businesses FOR DELETE
  TO authenticated USING (is_business_member(id));

-- ============================================================
-- POLICIES: MEMBERSHIPS
-- ============================================================
DROP POLICY IF EXISTS "select_own_memberships" ON memberships;
CREATE POLICY "select_own_memberships" ON memberships FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_memberships" ON memberships;
CREATE POLICY "insert_own_memberships" ON memberships FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_memberships" ON memberships;
CREATE POLICY "update_own_memberships" ON memberships FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_memberships" ON memberships;
CREATE POLICY "delete_own_memberships" ON memberships FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: BUSINESS PROFILES
-- ============================================================
DROP POLICY IF EXISTS "select_member_profiles" ON business_profiles;
CREATE POLICY "select_member_profiles" ON business_profiles FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_profiles" ON business_profiles;
CREATE POLICY "insert_member_profiles" ON business_profiles FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_profiles" ON business_profiles;
CREATE POLICY "update_member_profiles" ON business_profiles FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_profiles" ON business_profiles;
CREATE POLICY "delete_member_profiles" ON business_profiles FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: BUSINESS HOURS
-- ============================================================
DROP POLICY IF EXISTS "select_member_hours" ON business_hours;
CREATE POLICY "select_member_hours" ON business_hours FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_hours" ON business_hours;
CREATE POLICY "insert_member_hours" ON business_hours FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_hours" ON business_hours;
CREATE POLICY "update_member_hours" ON business_hours FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_hours" ON business_hours;
CREATE POLICY "delete_member_hours" ON business_hours FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: BUSINESS LOCATIONS
-- ============================================================
DROP POLICY IF EXISTS "select_member_locations" ON business_locations;
CREATE POLICY "select_member_locations" ON business_locations FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_locations" ON business_locations;
CREATE POLICY "insert_member_locations" ON business_locations FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_locations" ON business_locations;
CREATE POLICY "update_member_locations" ON business_locations FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_locations" ON business_locations;
CREATE POLICY "delete_member_locations" ON business_locations FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: BUSINESS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "select_member_policies" ON business_policies;
CREATE POLICY "select_member_policies" ON business_policies FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_policies" ON business_policies;
CREATE POLICY "insert_member_policies" ON business_policies FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_policies" ON business_policies;
CREATE POLICY "update_member_policies" ON business_policies FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_policies" ON business_policies;
CREATE POLICY "delete_member_policies" ON business_policies FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: BUSINESS RULES
-- ============================================================
DROP POLICY IF EXISTS "select_member_rules" ON business_rules;
CREATE POLICY "select_member_rules" ON business_rules FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_rules" ON business_rules;
CREATE POLICY "insert_member_rules" ON business_rules FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_rules" ON business_rules;
CREATE POLICY "update_member_rules" ON business_rules FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_rules" ON business_rules;
CREATE POLICY "delete_member_rules" ON business_rules FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: PRODUCT CATEGORIES
-- ============================================================
DROP POLICY IF EXISTS "select_member_product_categories" ON product_categories;
CREATE POLICY "select_member_product_categories" ON product_categories FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_product_categories" ON product_categories;
CREATE POLICY "insert_member_product_categories" ON product_categories FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_product_categories" ON product_categories;
CREATE POLICY "update_member_product_categories" ON product_categories FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_product_categories" ON product_categories;
CREATE POLICY "delete_member_product_categories" ON product_categories FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: PRODUCTS
-- ============================================================
DROP POLICY IF EXISTS "select_member_products" ON products;
CREATE POLICY "select_member_products" ON products FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_products" ON products;
CREATE POLICY "insert_member_products" ON products FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_products" ON products;
CREATE POLICY "update_member_products" ON products FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_products" ON products;
CREATE POLICY "delete_member_products" ON products FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: SERVICE CATEGORIES
-- ============================================================
DROP POLICY IF EXISTS "select_member_service_categories" ON service_categories;
CREATE POLICY "select_member_service_categories" ON service_categories FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_service_categories" ON service_categories;
CREATE POLICY "insert_member_service_categories" ON service_categories FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_service_categories" ON service_categories;
CREATE POLICY "update_member_service_categories" ON service_categories FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_service_categories" ON service_categories;
CREATE POLICY "delete_member_service_categories" ON service_categories FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: SERVICES
-- ============================================================
DROP POLICY IF EXISTS "select_member_services" ON services;
CREATE POLICY "select_member_services" ON services FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_services" ON services;
CREATE POLICY "insert_member_services" ON services FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_services" ON services;
CREATE POLICY "update_member_services" ON services FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_services" ON services;
CREATE POLICY "delete_member_services" ON services FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- POLICIES: FAQS
-- ============================================================
DROP POLICY IF EXISTS "select_member_faqs" ON faqs;
CREATE POLICY "select_member_faqs" ON faqs FOR SELECT
  TO authenticated USING (is_business_member(business_id));
DROP POLICY IF EXISTS "insert_member_faqs" ON faqs;
CREATE POLICY "insert_member_faqs" ON faqs FOR INSERT
  TO authenticated WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "update_member_faqs" ON faqs;
CREATE POLICY "update_member_faqs" ON faqs FOR UPDATE
  TO authenticated USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));
DROP POLICY IF EXISTS "delete_member_faqs" ON faqs;
CREATE POLICY "delete_member_faqs" ON faqs FOR DELETE
  TO authenticated USING (is_business_member(business_id));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_business_id ON memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_faqs_business_id ON faqs(business_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_business_id ON business_hours(business_id);
CREATE INDEX IF NOT EXISTS idx_business_policies_business_id ON business_policies(business_id);
CREATE INDEX IF NOT EXISTS idx_business_rules_business_id ON business_rules(business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_business_id ON business_locations(business_id);