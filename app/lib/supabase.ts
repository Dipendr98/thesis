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

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  plan_id: string;
  plan_name: string;
  pages: number;
  requirements: string;
  total_price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
}
