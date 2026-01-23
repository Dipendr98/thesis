import nodemailer from "nodemailer";
import { Resend } from "resend";

/**
 * Generate HTML email template for OTP
 */
function generateOtpEmailHtml(otp: string, ttlMin: number): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">ThesisTrack Login Verification</h2>
      <p style="font-size: 16px; color: #666;">Your one-time password (OTP) is:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; margin: 0;">${otp}</p>
      </div>
      <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>${ttlMin} minutes</strong>.</p>
      <p style="font-size: 14px; color: #999; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
}

/**
 * Send OTP email using Resend API (HTTP-based, more reliable)
 */
async function sendWithResend(to: string, otp: string, ttlMin: number) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  console.log('📧 [MAILER] Using Resend API');
  console.log('📧 [MAILER] API Key:', apiKey.substring(0, 7) + '...');
  console.log('📧 [MAILER] From email:', fromEmail);

  const resend = new Resend(apiKey);
  const startTime = Date.now();

  try {
    const { data, error } = await resend.emails.send({
      from: `ThesisTrack <${fromEmail}>`,
      to: [to],
      subject: "Your ThesisTrack Login OTP",
      html: generateOtpEmailHtml(otp, ttlMin),
      text: `Your OTP is ${otp}. It expires in ${ttlMin} minutes.`,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    const duration = Date.now() - startTime;
    console.log('✅ [MAILER] Email sent via Resend in', duration, 'ms');
    console.log('📧 [MAILER] Message ID:', data?.id);
    return { messageId: data?.id, method: 'resend' };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [MAILER] Resend send failed after', duration, 'ms:', error.message);
    throw error;
  }
}

/**
 * Send OTP email using SMTP (nodemailer fallback)
 */
async function sendWithSmtp(to: string, otp: string, ttlMin: number) {
  // Validate SMTP environment variables
  const requiredEnvVars = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing SMTP variables: ${missingVars.join(', ')}`);
  }

  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,  // 10 seconds
    greetingTimeout: 5000,     // 5 seconds
    socketTimeout: 10000,      // 10 seconds
  };

  console.log('📧 [MAILER] Using SMTP (nodemailer fallback)');
  console.log('📧 [MAILER] SMTP config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user ? `${config.auth.user.substring(0, 3)}***` : 'NOT SET',
  });

  const transporter = nodemailer.createTransport(config);
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  // Verify SMTP connection
  console.log('🔄 [MAILER] Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ [MAILER] SMTP connection verified');
  } catch (verifyError: any) {
    console.error('❌ [MAILER] SMTP verification failed:', verifyError.message);
    throw new Error(`SMTP connection failed: ${verifyError.message}`);
  }

  const mailOptions = {
    from: `"ThesisTrack" <${fromEmail}>`,
    to,
    subject: "Your ThesisTrack Login OTP",
    text: `Your OTP is ${otp}. It expires in ${ttlMin} minutes.`,
    html: generateOtpEmailHtml(otp, ttlMin),
  };

  console.log('📤 [MAILER] Sending email via SMTP...');
  const startTime = Date.now();

  try {
    const info = await transporter.sendMail(mailOptions);
    const duration = Date.now() - startTime;
    console.log('✅ [MAILER] Email sent via SMTP in', duration, 'ms');
    console.log('📧 [MAILER] Message ID:', info.messageId);
    return { messageId: info.messageId, method: 'smtp' };
  } catch (sendError: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [MAILER] SMTP send failed after', duration, 'ms:', sendError.message);
    throw sendError;
  }
}

/**
 * Send OTP email with automatic fallback strategy:
 * 1. Try Resend API first (HTTP-based, most reliable)
 * 2. Fall back to SMTP if Resend not configured
 */
export async function sendOtpEmail(to: string, otp: string, ttlMin: number = 10) {
  console.log('📧 [MAILER] Starting OTP email send process');
  console.log('📧 [MAILER] Recipient:', to);
  console.log('📧 [MAILER] OTP TTL:', ttlMin, 'minutes');

  const hasResend = !!process.env.RESEND_API_KEY;
  const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  console.log('📧 [MAILER] Available methods:', {
    resend: hasResend,
    smtp: hasSmtp,
  });

  // Try Resend first if configured
  if (hasResend) {
    try {
      return await sendWithResend(to, otp, ttlMin);
    } catch (resendError: any) {
      console.error('❌ [MAILER] Resend failed:', resendError.message);

      // Fall back to SMTP if available
      if (hasSmtp) {
        console.log('🔄 [MAILER] Falling back to SMTP...');
        try {
          return await sendWithSmtp(to, otp, ttlMin);
        } catch (smtpError: any) {
          console.error('❌ [MAILER] SMTP fallback also failed:', smtpError.message);
          throw new Error(`All email methods failed. Resend: ${resendError.message}. SMTP: ${smtpError.message}`);
        }
      }

      throw resendError;
    }
  }

  // Use SMTP if Resend not configured
  if (hasSmtp) {
    return await sendWithSmtp(to, otp, ttlMin);
  }

  // No email method configured
  throw new Error('No email service configured. Set either RESEND_API_KEY or SMTP credentials.');
}
