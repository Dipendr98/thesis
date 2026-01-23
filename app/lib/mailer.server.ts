import nodemailer from "nodemailer";

export function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Add timeout configuration to prevent hanging
    connectionTimeout: 10000, // 10 seconds to establish connection
    greetingTimeout: 5000,    // 5 seconds for server greeting
    socketTimeout: 10000,     // 10 seconds for socket inactivity
  });
}

export async function sendOtpEmail(to: string, otp: string, ttlMin: number = 10) {
  const transporter = makeTransporter();

  // Use FROM_EMAIL if available, fallback to SMTP_USER for backwards compatibility
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  // Create a timeout promise that rejects after 15 seconds
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Email sending timeout after 15 seconds')), 15000);
  });

  // Race between sending email and timeout
  const sendMailPromise = transporter.sendMail({
    from: `"ThesisTrack" <${fromEmail}>`,
    to,
    subject: "Your ThesisTrack Login OTP",
    text: `Your OTP is ${otp}. It expires in ${ttlMin} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">ThesisTrack Login Verification</h2>
        <p style="font-size: 16px; color: #666;">Your one-time password (OTP) is:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; margin: 0;">${otp}</p>
        </div>
        <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>${ttlMin} minutes</strong>.</p>
        <p style="font-size: 14px; color: #999; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  // Wait for either email to send or timeout
  await Promise.race([sendMailPromise, timeoutPromise]);
}
