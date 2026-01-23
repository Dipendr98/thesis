import { createClient } from "@supabase/supabase-js";

// Get environment variables with proper validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "✗ Missing");
  console.error("\nPlease ensure your .env file contains:");
  console.error("VITE_SUPABASE_URL=your-supabase-url");
  console.error("VITE_SUPABASE_ANON_KEY=your-supabase-anon-key");
  throw new Error("Supabase environment variables are not configured. Check the console for details.");
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
