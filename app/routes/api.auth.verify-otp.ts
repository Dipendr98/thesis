import { data } from "react-router";
import type { Route } from "./+types/api.auth.verify-otp";
import { verifyOtpCode } from "~/lib/otp-store.server";
import { storage } from "~/lib/storage";
import type { User } from "~/lib/storage";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;

    if (!email || !otp) {
      return data({ error: "Email and OTP are required" }, { status: 400 });
    }

    const result = await verifyOtpCode(email, otp);

    if (!result.success) {
      let errorMessage = "Invalid OTP";
      
      switch (result.reason) {
        case "NO_OTP":
          errorMessage = "No OTP found. Please request a new one.";
          break;
        case "EXPIRED":
          errorMessage = "OTP has expired. Please request a new one.";
          break;
        case "LOCKED":
          errorMessage = "Too many attempts. Please request a new OTP.";
          break;
        case "INVALID":
          errorMessage = result.attemptsLeft 
            ? `Invalid OTP. ${result.attemptsLeft} attempts remaining.`
            : "Invalid OTP";
          break;
      }

      return data({ 
        success: false, 
        error: errorMessage,
        attemptsLeft: result.attemptsLeft 
      }, { status: 401 });
    }

    // OTP verified - create or get user
    let user = storage.getUserByEmail(email);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email,
        createdAt: new Date().toISOString(),
      };
      storage.saveUser(user);
    }

    storage.setCurrentUser(user);
    
    return data({ 
      success: true, 
      message: "Login successful",
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return data({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
