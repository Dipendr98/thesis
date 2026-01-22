-- ThesisTrack Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  mobile TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing Plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  delivery_days INTEGER NOT NULL,
  base_price NUMERIC NOT NULL,
  price_per_page NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table (legacy)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  features JSONB NOT NULL,
  delivery_days INTEGER NOT NULL,
  pages_range TEXT NOT NULL,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  domain TEXT NOT NULL,
  type TEXT NOT NULL,
  pages INTEGER NOT NULL,
  citation_style TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  notes TEXT,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'Pending Payment',
  abstract_required BOOLEAN DEFAULT false,
  plagiarism_check BOOLEAN DEFAULT false,
  include_charts BOOLEAN DEFAULT false,
  reference_files JSONB,
  payment_screenshot TEXT,
  deliverables JSONB,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Settings table
CREATE TABLE IF NOT EXISTS qr_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  qr_image_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON pricing_plans;
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON pricing_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qr_settings_updated_at ON qr_settings;
CREATE TRIGGER update_qr_settings_updated_at BEFORE UPDATE ON qr_settings
    FOR EACH ROW EXECUTE FUNCTION update_qr_settings_updated_at();

-- Insert default data
INSERT INTO admins (id, email, password_hash, role)
VALUES ('admin-1', 'admin@thesistrack.com', '$2a$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO pricing_plans (id, name, delivery_days, base_price, price_per_page)
VALUES
  ('express', 'Express Delivery', 3, 2000, 300),
  ('standard', 'Standard Delivery', 7, 1500, 200),
  ('economy', 'Economy Delivery', 14, 1000, 150)
ON CONFLICT (id) DO NOTHING;

INSERT INTO plans (id, name, price, features, delivery_days, pages_range, popular)
VALUES
  ('1', 'Basic', 2999, '["5-10 pages", "1 revision", "7 days delivery", "Basic plagiarism check", "APA/MLA citation"]'::jsonb, 7, '5-10', false),
  ('2', 'Standard', 4999, '["10-20 pages", "2 revisions", "5 days delivery", "Advanced plagiarism check", "All citation styles", "Charts & figures"]'::jsonb, 5, '10-20', true),
  ('3', 'Premium', 7999, '["20-30 pages", "3 revisions", "3 days delivery", "Premium plagiarism check", "All citation styles", "Charts & figures", "Abstract included", "Priority support"]'::jsonb, 3, '20-30', false),
  ('4', 'Custom', 0, '["30+ pages", "Unlimited revisions", "Custom delivery", "Premium plagiarism check", "All citation styles", "Charts & figures", "Abstract included", "Dedicated support"]'::jsonb, 0, '30+', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO qr_settings (id, qr_image_url)
VALUES ('default', 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Anyone can insert users (for registration)
CREATE POLICY "Anyone can create user"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can create their own orders
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own orders
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Anyone can view pricing plans
CREATE POLICY "Anyone can view pricing plans"
  ON pricing_plans FOR SELECT
  TO public
  USING (true);

-- Anyone can view plans
CREATE POLICY "Anyone can view plans"
  ON plans FOR SELECT
  TO public
  USING (true);

-- Anyone can view QR settings
CREATE POLICY "Anyone can view QR settings"
  ON qr_settings FOR SELECT
  TO public
  USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
