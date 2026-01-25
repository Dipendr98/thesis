-- Migration to fix pricing plan update failure
-- Issue: pricing_plans table has RLS enabled but no UPDATE policy
-- Solution: Add admin check function and UPDATE policies for admin-managed tables

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid()
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Add UPDATE policy for pricing_plans (allows admins to update pricing)
DROP POLICY IF EXISTS "Admins can update pricing plans" ON pricing_plans;
CREATE POLICY "Admins can update pricing plans"
  ON pricing_plans FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Add UPDATE policy for plans (allows admins to update plans)
DROP POLICY IF EXISTS "Admins can update plans" ON plans;
CREATE POLICY "Admins can update plans"
  ON plans FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Add UPDATE policy for qr_settings (allows admins to update QR settings)
DROP POLICY IF EXISTS "Admins can update QR settings" ON qr_settings;
CREATE POLICY "Admins can update QR settings"
  ON qr_settings FOR UPDATE
  TO authenticated
  USING (is_admin());
