import { supabase, type PricingPlan, type Order } from "./supabase";
import { supabaseAdmin } from "./supabase-admin.server";

// Type definitions
export interface User {
  id: string;
  email: string;
  mobile?: string;
  name?: string;
  created_at?: string;
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  role: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  delivery_days: number;
  pages_range: string;
  popular?: boolean;
}

export interface QRSettings {
  id: string;
  qr_image_url: string;
  updated_at?: string;
}

// Users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data || [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;
  return data;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function createUser(user: Omit<User, "id" | "created_at">): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert([user])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Admin
export async function getAdmin(email: string = "admin@thesistrack.com"): Promise<Admin | null> {
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;
  return data;
}

export async function createAdmin(admin: Omit<Admin, "id">): Promise<Admin> {
  const { data, error } = await supabase
    .from("admins")
    .insert([admin])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Plans
export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
  return data || [];
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function savePlans(plans: Plan[]): Promise<void> {
  const { error } = await supabase
    .from("plans")
    .upsert(plans);

  if (error) throw error;
}

// QR Settings
export async function getQRSettings(): Promise<QRSettings | null> {
  const { data, error } = await supabase
    .from("qr_settings")
    .select("*")
    .eq("id", "default")
    .single();

  if (error) return null;
  return data;
}

export async function updateQRSettings(qr_image_url: string): Promise<QRSettings | null> {
  // Use admin client to bypass RLS for admin operations
  const { data, error } = await supabaseAdmin
    .from("qr_settings")
    .upsert({ id: "default", qr_image_url })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadQRCodeImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `qr-code-${Date.now()}.${fileExt}`;
  const filePath = `qr-codes/${fileName}`;

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from("uploads")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload QR code: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabaseAdmin.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

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
  // Use admin client to bypass RLS for admin operations
  const { data, error } = await supabaseAdmin
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
    .insert([{ status: "pending", ...order }])
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
  // Use admin client to bypass RLS for admin operations
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}


export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
  return data || [];
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Upload order paper/deliverable
export async function uploadOrderPaper(
  file: File,
  orderId: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("user_id")
    .eq("id", orderId)
    .single();

  if (orderError || !order?.user_id) {
    throw new Error("Failed to resolve order user.");
  }

  const dotIndex = file.name.lastIndexOf(".");
  const fileExt = dotIndex > -1 && dotIndex < file.name.length - 1
    ? file.name.slice(dotIndex + 1)
    : "pdf";
  const filePath = `orders/${order.user_id}/${orderId}/paper.${fileExt}`;

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from("uploads")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload order paper: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabaseAdmin.storage
    .from("uploads")
    .getPublicUrl(filePath);

  return { storagePath: filePath, publicUrl: urlData.publicUrl };
}

// Update order deliverables (uses admin client to bypass RLS)
export async function updateOrderDeliverables(
  orderId: string,
  deliverable: { name: string; storagePath: string; publicUrl?: string }
): Promise<Order | null> {
  // First get the existing deliverables
  const { data: existingOrder, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("deliverables")
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  // Append to existing deliverables or create new array
  const existingDeliverables = existingOrder?.deliverables || [];
  const newDeliverable = {
    url: deliverable.publicUrl,
    name: deliverable.name,
    storage_path: deliverable.storagePath,
    uploaded_at: new Date().toISOString(),
  };

  const updatedDeliverables = Array.isArray(existingDeliverables)
    ? [...existingDeliverables, newDeliverable]
    : [newDeliverable];

  // Update the order with new deliverables
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ deliverables: updatedDeliverables })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a deliverable from an order
export async function deleteOrderDeliverable(
  orderId: string,
  deliverableIdentifier: { storagePath?: string | null; url?: string | null }
): Promise<Order | null> {
  // First get the existing deliverables
  const { data: existingOrder, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("deliverables")
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  const existingDeliverables = existingOrder?.deliverables || [];

  // Filter out the deliverable to delete
  const updatedDeliverables = Array.isArray(existingDeliverables)
    ? existingDeliverables.filter((d: any) =>
        deliverableIdentifier.storagePath
          ? d.storage_path !== deliverableIdentifier.storagePath
          : d.url !== deliverableIdentifier.url
      )
    : [];

  // Update the order
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ deliverables: updatedDeliverables })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createOrderPaperSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from("uploads")
    .createSignedUrl(storagePath, 60 * 10);

  if (error) throw error;
  return data.signedUrl;
}
