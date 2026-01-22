import { data } from "react-router";
import type { Route } from "./+types/api.auth.request-otp";
import { sendOtpEmail } from "~/lib/mailer.server";
import { generateOtp, storeOtp } from "~/lib/otp-store.server";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
      return data({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return data({ error: "Invalid email format" }, { status: 400 });
    }

    const otp = generateOtp();
    const ttlMin = Number(process.env.OTP_TTL_MIN || 10);

    await storeOtp(email, otp, ttlMin);

    try {
      await sendOtpEmail(email, otp, ttlMin);
      return data({ success: true, message: "OTP sent successfully" });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Log OTP to console for development
      console.log(`📧 OTP for ${email}: ${otp}`);
      return data({ 
        success: true, 
        message: "OTP generated (check console - email service unavailable)",
        devMode: true,
        otp: process.env.NODE_ENV === "development" ? otp : undefined
      });
    }
  } catch (error) {
    console.error("Request OTP error:", error);
    return data({ error: "Failed to send OTP" }, { status: 500 });
  }
}
