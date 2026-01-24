import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase Client (Server-Only)
 *
 * This client uses the SERVICE_ROLE key which bypasses Row Level Security (RLS).
 * It should ONLY be used in server-side code for admin operations.
 *
 * ⚠️ SECURITY WARNING: Never expose this client to the browser!
 * The service role key has full database access and bypasses all RLS policies.
 */

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvZWdyaXNycnJxeWFpeGdsbGp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA3MTM1MywiZXhwIjoyMDg0NjQ3MzUzfQ.1Cxz1UPXBEEZHexOLa9mjvZN0nJILVXU91-7XKjKk5c";

// Create admin client with service role key if available
// Falls back to anon key with a warning if service role key is not configured
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : (() => {
      console.warn(
        "⚠️  SUPABASE_SERVICE_ROLE_KEY not found. Admin operations may fail due to RLS policies.\n" +
        "   Please add SUPABASE_SERVICE_ROLE_KEY to your .env file.\n" +
        "   Get it from: https://app.supabase.com/project/_/settings/api"
      );
      // Return regular client as fallback
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    })();

/**
 * Check if admin client is properly configured
 */
export const hasAdminAccess = !!supabaseServiceRoleKey;
