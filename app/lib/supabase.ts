import { createClient } from "@supabase/supabase-js";

// Get environment variables - works for both server and client
const supabaseUrl =
  typeof process !== "undefined" && process.env.SUPABASE_PROJECT_URL
    ? process.env.SUPABASE_PROJECT_URL
    : import.meta.env.VITE_SUPABASE_PROJECT_URL;

const supabaseKey =
  typeof process !== "undefined" && process.env.SUPABASE_API_KEY
    ? process.env.SUPABASE_API_KEY
    : import.meta.env.VITE_SUPABASE_API_KEY;

// Create a placeholder client if env vars are missing (for development)
// This prevents the entire app from crashing during initialization
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Missing Supabase environment variables. Please check your .env file.");
    console.warn("Using placeholder client - authentication features will not work.");
    // Return a placeholder client with dummy values
    return createClient(
      "https://placeholder.supabase.co",
      "placeholder-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = createSupabaseClient();
export const hasValidConfig = !!(supabaseUrl && supabaseKey);

export interface PricingPlan {
  id: string;
  name: string;
  delivery_days: number;
  base_price: number;
  price_per_page: number;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  topic: string;
  domain: string;
  type: string;
  pages: number;
  citation_style: string;
  deadline: string;
  notes?: string;
  plan_id: string;
  status: string;
  abstract_required?: boolean;
  plagiarism_check?: boolean;
  include_charts?: boolean;
  reference_files?: any;
  payment_screenshot?: string;
  deliverables?: any;
  verified_at?: string;
  verified_by?: string;
  total_price: number;
  created_at?: string;
  updated_at?: string;
}
