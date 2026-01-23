import nodemailer from "nodemailer";

export function makeTransporter() {
  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Reduced timeout configuration to fail faster
    connectionTimeout: 5000,  // 5 seconds to establish connection
    greetingTimeout: 3000,    // 3 seconds for server greeting
    socketTimeout: 5000,      // 5 seconds for socket inactivity
  };

  console.log('📧 [MAILER] Creating transporter with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user ? `${config.auth.user.substring(0, 3)}***` : 'NOT SET',
    hasPassword: !!config.auth.pass,
    passwordLength: config.auth.pass?.length || 0,
  });

  return nodemailer.createTransport(config);
}

export async function sendOtpEmail(to: string, otp: string, ttlMin: number = 10) {
  console.log('📧 [MAILER] Starting OTP email send process');
  console.log('📧 [MAILER] Recipient:', to);
  console.log('📧 [MAILER] OTP TTL:', ttlMin, 'minutes');

  // Validate environment variables
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
    const error = new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('❌ [MAILER] Configuration error:', error.message);
    throw error;
  }

  const transporter = makeTransporter();

  // Use FROM_EMAIL if available, fallback to SMTP_USER for backwards compatibility
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  console.log('📧 [MAILER] From email:', fromEmail);

  // Verify SMTP connection before attempting to send
  console.log('🔄 [MAILER] Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ [MAILER] SMTP connection verified successfully');
  } catch (verifyError: any) {
    console.error('❌ [MAILER] SMTP verification failed:', {
      message: verifyError.message,
      code: verifyError.code,
      command: verifyError.command,
      response: verifyError.response,
      stack: verifyError.stack,
    });
    throw new Error(`SMTP connection failed: ${verifyError.message} (${verifyError.code})`);
  }

  const mailOptions = {
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
  };

  console.log('📤 [MAILER] Sending email...');
  const startTime = Date.now();

  try {
    const info = await transporter.sendMail(mailOptions);
    const duration = Date.now() - startTime;
    console.log('✅ [MAILER] Email sent successfully in', duration, 'ms');
    console.log('📧 [MAILER] Message ID:', info.messageId);
    console.log('📧 [MAILER] Response:', info.response);
    return info;
  } catch (sendError: any) {
    const duration = Date.now() - startTime;
    console.error('❌ [MAILER] Email send failed after', duration, 'ms:', {
      message: sendError.message,
      code: sendError.code,
      command: sendError.command,
      response: sendError.response,
      responseCode: sendError.responseCode,
      stack: sendError.stack,
    });
    throw sendError;
  }
}
