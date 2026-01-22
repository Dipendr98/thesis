import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_PROJECT_URL!;
const supabaseKey = process.env.SUPABASE_API_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

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
