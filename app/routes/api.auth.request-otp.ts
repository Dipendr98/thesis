import { data } from "react-router";
import type { Route } from "./+types/api.auth.request-otp";
import { sendOtpEmail } from "~/lib/mailer.server";
import { generateOtp, storeOtp } from "~/lib/otp-store.server";

export async function action({ request }: Route.ActionArgs) {
  const requestId = Date.now().toString(36);
  console.log(`\n🔐 [REQUEST-OTP][${requestId}] ===== Starting OTP request =====`);

  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    console.log(`📧 [REQUEST-OTP][${requestId}] Email received:`, email);

    if (!email) {
      console.log(`❌ [REQUEST-OTP][${requestId}] Validation failed: Email is required`);
      return data({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`❌ [REQUEST-OTP][${requestId}] Validation failed: Invalid email format`);
      return data({ error: "Invalid email format" }, { status: 400 });
    }

    console.log(`✅ [REQUEST-OTP][${requestId}] Email validation passed`);

    const otp = generateOtp();
    const ttlMin = Number(process.env.OTP_TTL_MIN || 10);

    console.log(`🔢 [REQUEST-OTP][${requestId}] Generated OTP: ${otp} (TTL: ${ttlMin} min)`);
    console.log(`💾 [REQUEST-OTP][${requestId}] Storing OTP in database...`);

    await storeOtp(email, otp, ttlMin);

    console.log(`✅ [REQUEST-OTP][${requestId}] OTP stored successfully`);
    console.log(`📤 [REQUEST-OTP][${requestId}] Attempting to send email...`);

    try {
      await sendOtpEmail(email, otp, ttlMin);
      console.log(`✅ [REQUEST-OTP][${requestId}] Email sent successfully`);
      return data({ success: true, message: "OTP sent successfully" });
    } catch (emailError: any) {
      console.error(`❌ [REQUEST-OTP][${requestId}] Email sending failed:`, {
        error: emailError.message,
        code: emailError.code,
        command: emailError.command,
        stack: emailError.stack,
      });

      // Log OTP to console for development
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚨 [DEV MODE] OTP for ${email}: ${otp}`);
      console.log(`⏰ Valid for: ${ttlMin} minutes`);
      console.log(`❌ Email Error: ${emailError.message}`);
      console.log(`${'='.repeat(60)}\n`);

      return data({
        success: true,
        message: "OTP generated (check console - email service unavailable)",
        devMode: true,
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
        error: process.env.NODE_ENV === "development" ? emailError.message : undefined,
      });
    }
  } catch (error: any) {
    console.error(`❌ [REQUEST-OTP][${requestId}] Request failed:`, {
      error: error.message,
      stack: error.stack,
    });
    return data({ error: "Failed to send OTP" }, { status: 500 });
  } finally {
    console.log(`🔐 [REQUEST-OTP][${requestId}] ===== Request completed =====\n`);
  }
}
