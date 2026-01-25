import { storage } from "./storage";
import type { User, Admin } from "./storage";
import { supabase } from "./supabase";

// Email-based OTP authentication (uses server API routes)
// These are client-side helpers for backwards compatibility

export const getCurrentUser = (): User | null => {
  return storage.getCurrentUser();
};

export const getCurrentAdmin = (): Admin | null => {
  return storage.getCurrentAdmin();
};

export const loginAdmin = (email: string, password: string): Admin | null => {
  const admin = storage.getAdmin();
  if (admin && admin.email === email && admin.passwordHash === password) {
    storage.setCurrentAdmin(admin);
    return admin;
  }
  return null;
};

export const logoutUser = async (): Promise<void> => {
  storage.setCurrentUser(null);
  // Also sign out from Supabase if using OAuth
  await supabase.auth.signOut();
};

export const logoutAdmin = (): void => {
  storage.setCurrentAdmin(null);
};

// Legacy mobile OTP functions (deprecated - keeping for compatibility)
export const sendOTP = (mobile: string): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`📱 Legacy OTP for ${mobile}: ${otp}`);
  return otp;
};

export const verifyOTP = (mobile: string, otp: string, sentOtp: string): User | null => {
  if (otp !== sentOtp) {
    return null;
  }

  let user = storage.getUserByMobile(mobile);
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      email: `${mobile}@legacy.local`,
      mobile,
      createdAt: new Date().toISOString(),
    };
    storage.saveUser(user);
  }

  storage.setCurrentUser(user);
  return user;
};
