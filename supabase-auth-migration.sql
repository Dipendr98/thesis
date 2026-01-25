-- ============================================================================
-- ThesisTrack Database Migration: Auth Integration & RLS Fix
-- ============================================================================
-- This migration properly links public.users to auth.users and fixes RLS policies.
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TRIGGER FUNCTION FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. HELPER FUNCTION: Check if current user is an admin
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
  );
END;
$$;

-- ============================================================================
-- 4. FIX USERS TABLE: Link to auth.users (NO random UUID generation)
-- ============================================================================

-- Remove default UUID generator - users.id MUST come from auth.users.id
ALTER TABLE public.users
  ALTER COLUMN id DROP DEFAULT;

-- Add foreign key constraint to auth.users (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_auth_users_fk'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_auth_users_fk
      FOREIGN KEY (id) REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 5. FOREIGN KEY: orders.user_id -> users.id
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_user_id_fk'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_user_id_fk
      FOREIGN KEY (user_id) REFERENCES public.users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- 6. TRIGGERS: Automatic updated_at timestamps
-- ============================================================================

-- Users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admins
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pricing Plans
DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON public.pricing_plans;
CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Plans (legacy)
DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- QR Settings
DROP TRIGGER IF EXISTS update_qr_settings_updated_at ON public.qr_settings;
CREATE TRIGGER update_qr_settings_updated_at
  BEFORE UPDATE ON public.qr_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. DROP ALL EXISTING POLICIES (Clean slate)
-- ============================================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can create user" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Pricing plans policies
DROP POLICY IF EXISTS "Anyone can view pricing plans" ON public.pricing_plans;
DROP POLICY IF EXISTS "Admins can update pricing plans" ON public.pricing_plans;
DROP POLICY IF EXISTS "Admins can insert pricing plans" ON public.pricing_plans;
DROP POLICY IF EXISTS "Admins can delete pricing plans" ON public.pricing_plans;

-- Plans policies
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can update plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can insert plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can delete plans" ON public.plans;

-- QR settings policies
DROP POLICY IF EXISTS "Anyone can view QR settings" ON public.qr_settings;
DROP POLICY IF EXISTS "Admins can update QR settings" ON public.qr_settings;
DROP POLICY IF EXISTS "Admins can insert QR settings" ON public.qr_settings;

-- Admins policies
DROP POLICY IF EXISTS "Admins can view own record" ON public.admins;
DROP POLICY IF EXISTS "Admins can update own record" ON public.admins;

-- ============================================================================
-- 9. CREATE RLS POLICIES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- USERS TABLE
-- ---------------------------------------------------------------------------

-- Users can view their own profile (auth.uid() must match users.id)
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can create their own profile (id must match auth.uid())
-- This is the key fix: users can ONLY create a profile with their auth ID
CREATE POLICY "Users can create own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- ORDERS TABLE
-- ---------------------------------------------------------------------------

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders (user_id must match auth.uid())
CREATE POLICY "Users can create own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders
CREATE POLICY "Users can update own orders"
  ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update all orders (for status changes, deliverables, etc.)
CREATE POLICY "Admins can update all orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- PRICING PLANS TABLE (Public read, admin write)
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view pricing plans"
  ON public.pricing_plans
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update pricing plans"
  ON public.pricing_plans
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert pricing plans"
  ON public.pricing_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete pricing plans"
  ON public.pricing_plans
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- PLANS TABLE (Legacy - Public read, admin write)
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view plans"
  ON public.plans
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update plans"
  ON public.plans
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert plans"
  ON public.plans
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete plans"
  ON public.plans
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- QR SETTINGS TABLE (Public read, admin write)
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view QR settings"
  ON public.qr_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update QR settings"
  ON public.qr_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert QR settings"
  ON public.qr_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- ADMINS TABLE (Restricted access)
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view own record"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own record"
  ON public.admins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

COMMIT;

-- ============================================================================
-- 11. PRICING PLAN DATA (Run after COMMIT)
-- ============================================================================

-- Upsert: Standard 14-day delivery plan (single pricing option)
INSERT INTO public.pricing_plans (id, name, delivery_days, base_price, price_per_page)
VALUES ('standard', 'Standard Delivery', 14, 2000, 50)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  delivery_days = EXCLUDED.delivery_days,
  base_price = EXCLUDED.base_price,
  price_per_page = EXCLUDED.price_per_page,
  updated_at = NOW();

-- Remove other pricing plans (keep only standard)
DELETE FROM public.pricing_plans WHERE id != 'standard';

-- ============================================================================
-- 12. DEFAULT QR SETTINGS (if not exists)
-- ============================================================================

INSERT INTO public.qr_settings (id, qr_image_url)
VALUES ('default', 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop')
ON CONFLICT (id) DO NOTHING;
