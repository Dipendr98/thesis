import bcrypt from "bcryptjs";

interface OTPRecord {
  hash: string;
  expiresAt: number;
  attemptsLeft: number;
}

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map<string, OTPRecord>();

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function storeOtp(email: string, otp: string, ttlMinutes: number = 10): Promise<void> {
  const hash = await bcrypt.hash(otp, 10);
  otpStore.set(email, {
    hash,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    attemptsLeft: 5,
  });
}

export async function verifyOtpCode(email: string, otp: string): Promise<{ success: boolean; reason?: string; attemptsLeft?: number }> {
  const record = otpStore.get(email);

  if (!record) {
    return { success: false, reason: "NO_OTP" };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { success: false, reason: "EXPIRED" };
  }

  if (record.attemptsLeft <= 0) {
    otpStore.delete(email);
    return { success: false, reason: "LOCKED" };
  }

  const match = await bcrypt.compare(otp, record.hash);
  
  if (!match) {
    record.attemptsLeft -= 1;
    otpStore.set(email, record);
    return { success: false, reason: "INVALID", attemptsLeft: record.attemptsLeft };
  }

  otpStore.delete(email);
  return { success: true };
}

export function clearOtp(email: string): void {
  otpStore.delete(email);
}
