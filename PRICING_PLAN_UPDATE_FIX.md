# Pricing Plan Update Fix

## Problem
The pricing plan update functionality was failing with the error "Failed to update pricing plan. Please try again."

## Root Cause
The `pricing_plans` table has Row Level Security (RLS) enabled, but only had a SELECT policy defined. There was **no UPDATE policy**, which caused all update attempts to be blocked by the database, even though the application code was correct.

## Solution
Added the following database changes:

1. **Admin Check Function**: Created `is_admin()` helper function to verify if the current user is an admin
2. **UPDATE Policies**: Added UPDATE policies for admin-managed tables:
   - `pricing_plans` - allows admins to update pricing
   - `plans` - allows admins to update legacy plans
   - `qr_settings` - allows admins to update QR payment settings

## How to Apply the Fix

### Option 1: Run the Migration File (Recommended)
1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `fix-pricing-plan-update-policy.sql` and paste it into the editor
5. Click **Run** to execute the migration
6. Verify the policies were created by running:
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('pricing_plans', 'plans', 'qr_settings');
   ```

### Option 2: Run the Full Schema (Fresh Setup)
If you're setting up a fresh database:
1. Go to your Supabase project SQL Editor
2. Copy the entire contents of `supabase-schema.sql`
3. Run it in the SQL Editor

## Verification
After applying the fix, test the pricing plan update:

1. Log in to the admin panel
2. Navigate to **Pricing** page
3. Click **Edit** on the pricing plan
4. Change the base price or delivery days
5. Click **Save Changes**
6. The update should succeed without errors

## Technical Details

### The `is_admin()` Function
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid()
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;
```

This function checks if the currently authenticated user exists in the `admins` table.

### The UPDATE Policy
```sql
CREATE POLICY "Admins can update pricing plans"
  ON pricing_plans FOR UPDATE
  TO authenticated
  USING (is_admin());
```

This policy allows authenticated users who are admins (verified by `is_admin()`) to update rows in the `pricing_plans` table.

## Files Changed
- `supabase-schema.sql` - Updated main schema with helper function and policies
- `fix-pricing-plan-update-policy.sql` - Standalone migration file
- `PRICING_PLAN_UPDATE_FIX.md` - This documentation

## Notes
- The same issue could have affected QR settings and legacy plans updates, so UPDATE policies were added for those tables as well
- The fix maintains security by only allowing authenticated admin users to make updates
- Public users can still view pricing plans (SELECT policy remains unchanged)
