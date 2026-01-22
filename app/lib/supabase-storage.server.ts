import { supabase, type PricingPlan, type Order } from "./supabase";

// Pricing Plans
export async function getPricingPlans(): Promise<PricingPlan[]> {
  const { data, error } = await supabase
    .from("pricing_plans")
    .select("*")
    .order("delivery_days", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getPricingPlan(id: string): Promise<PricingPlan | null> {
  const { data, error } = await supabase
    .from("pricing_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function updatePricingPlan(
  id: string,
  updates: Partial<Pick<PricingPlan, "base_price" | "price_per_page" | "delivery_days">>
): Promise<PricingPlan | null> {
  const { data, error } = await supabase
    .from("pricing_plans")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Orders
export async function createOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at">
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert([{ ...order, status: "pending" }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
