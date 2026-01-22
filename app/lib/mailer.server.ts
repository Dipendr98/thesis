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
  });
}

export async function sendOtpEmail(to: string, otp: string, ttlMin: number = 10) {
  const transporter = makeTransporter();

  await transporter.sendMail({
    from: `"ThesisTrack" <${process.env.SMTP_USER}>`,
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
}
