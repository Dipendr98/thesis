-- ============================================================================
-- ThesisTrack: Automatic User Profile Creation on Auth Signup
-- ============================================================================
-- This creates a trigger that automatically creates a public.users record
-- whenever a new user signs up via Supabase Auth.
-- Run this AFTER the main migration script.
-- ============================================================================

-- ============================================================================
-- 1. FUNCTION: Handle New Auth User Signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,                                          -- Use auth.users.id as primary key
    NEW.email,                                       -- Copy email from auth
    COALESCE(NEW.raw_user_meta_data->>'name',
             NEW.raw_user_meta_data->>'full_name',
             SPLIT_PART(NEW.email, '@', 1)),         -- Name from metadata or email prefix
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. TRIGGER: Create user profile on auth.users insert
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. FUNCTION: Handle User Deletion (Optional cleanup)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- The CASCADE constraint should handle this, but this is a safety net
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- ============================================================================
-- 4. TRIGGER: Clean up user profile on auth.users delete
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- ============================================================================
-- 5. BACKFILL: Create profiles for existing auth users
-- ============================================================================
-- Run this once to create public.users records for any existing auth users

INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1)
  ) AS name,
  au.created_at,
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
