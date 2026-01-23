# Email Troubleshooting Guide

## Common Issue: Connection Timeout (ETIMEDOUT)

If you see this error:
```
Error: Connection timeout
code: 'ETIMEDOUT',
command: 'CONN'
```

This means the SMTP server connection is failing. Follow the steps below to fix it.

## Root Causes & Solutions

### 1. **Resend SMTP Issues** (Most Common)

**Problem**: Resend SMTP requires a verified domain and can be unreliable.

**Solution**: Switch to Gmail (recommended) or verify your domain in Resend.

#### Option A: Switch to Gmail (Easiest)

1. Enable 2-factor authentication on your Google account
2. Generate an app password at https://myaccount.google.com/apppasswords
3. Update your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
FROM_EMAIL=your-email@gmail.com
```

#### Option B: Fix Resend Configuration

1. Verify your domain at https://resend.com/domains
2. Update your `.env` file:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_YourActualAPIKey
FROM_EMAIL=noreply@your-verified-domain.com
```

**Important**: `FROM_EMAIL` must be from a domain you've verified in Resend!

### 2. **Missing Environment Variables**

Check that ALL required variables are set:

```bash
# Check your environment variables
echo "SMTP_HOST: $SMTP_HOST"
echo "SMTP_PORT: $SMTP_PORT"
echo "SMTP_USER: $SMTP_USER"
echo "SMTP_PASS: $SMTP_PASS (length: ${#SMTP_PASS})"
echo "FROM_EMAIL: $FROM_EMAIL"
```

If any are missing or empty, the email will fail.

### 3. **Railway/Deployment Issues**

If running on Railway or other platforms:

1. Go to your Railway project settings
2. Navigate to Variables tab
3. Ensure all SMTP variables are set correctly
4. Redeploy after making changes

### 4. **Firewall/Network Issues**

Some networks block SMTP ports (465, 587). If Gmail/Resend don't work:

1. Try port 587 instead of 465:
```env
SMTP_PORT=587
```

2. Check if your network/firewall allows SMTP traffic

## Debugging with Console Logs

The updated code now includes comprehensive logging. When you request an OTP, check the console for:

```
🔐 [REQUEST-OTP][xxx] ===== Starting OTP request =====
📧 [REQUEST-OTP][xxx] Email received: user@example.com
✅ [REQUEST-OTP][xxx] Email validation passed
🔢 [REQUEST-OTP][xxx] Generated OTP: 123456 (TTL: 10 min)
💾 [REQUEST-OTP][xxx] Storing OTP in database...
✅ [REQUEST-OTP][xxx] OTP stored successfully
📤 [REQUEST-OTP][xxx] Attempting to send email...

📧 [MAILER] Creating transporter with config: {...}
🔄 [MAILER] Verifying SMTP connection...
```

The logs will show exactly where the failure occurs:

- **❌ Missing environment variables**: Check your `.env` file
- **❌ SMTP verification failed**: Connection to SMTP server failed (network/auth issue)
- **❌ Email send failed**: Email composition or sending failed

## Quick Fix Checklist

- [ ] All SMTP variables are set in `.env` or Railway
- [ ] Using Gmail with app password (not regular password)
- [ ] If using Resend, domain is verified
- [ ] FROM_EMAIL matches the SMTP_USER (for Gmail) or verified domain (for Resend)
- [ ] Restarted the application after changing `.env`
- [ ] Check console logs for detailed error messages

## Development Mode Fallback

The system now includes a fallback for development:

- If email fails, the OTP will be printed to the console
- Response includes `devMode: true`
- In development, the OTP is included in the response

**Console output when email fails**:
```
============================================================
🚨 [DEV MODE] OTP for user@example.com: 123456
⏰ Valid for: 10 minutes
❌ Email Error: Connection timeout
============================================================
```

## Still Having Issues?

1. Check the full console logs for detailed error information
2. Verify your SMTP credentials are correct
3. Try switching from Resend to Gmail or vice versa
4. Ensure your deployment platform allows outbound SMTP connections
5. Check if your email provider requires additional security settings
