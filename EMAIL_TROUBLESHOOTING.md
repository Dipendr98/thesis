# Email Troubleshooting Guide

## New Implementation: Dual Email System

The application now supports **two email sending methods** with automatic fallback:

1. **Resend API** (Primary, Recommended) - HTTP-based, no SMTP port issues
2. **SMTP** (Fallback) - Traditional email protocol (Gmail, etc.)

The system automatically tries Resend first, then falls back to SMTP if Resend is not configured.

## Quick Start: Recommended Setup

### Option 1: Resend API (Recommended for Production)

**Why Resend?**
- ✅ HTTP-based (no firewall/port issues)
- ✅ Works reliably in containerized/cloud environments
- ✅ Fast and simple setup
- ✅ Free tier available for testing

**Setup Steps:**

1. Sign up at https://resend.com
2. Get your API key from https://resend.com/api-keys
3. Set environment variable:

```env
RESEND_API_KEY=re_YourResendAPIKey
FROM_EMAIL=onboarding@resend.dev  # For testing
# FROM_EMAIL=noreply@yourdomain.com  # After domain verification
```

**For Testing**: Use `onboarding@resend.dev` - works immediately, no verification needed!

**For Production**: Verify your domain at https://resend.com/domains, then use an email from your verified domain.

### Option 2: SMTP Fallback (Gmail Example)

Only needed if Resend is not configured or as a backup.

1. Enable 2-factor authentication on your Google account
2. Generate an app password at https://myaccount.google.com/apppasswords
3. Set environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
FROM_EMAIL=your-email@gmail.com
```

⚠️ **Note**: SMTP connections may fail in cloud/containerized environments due to firewall restrictions.

## Common Issues & Solutions

### Issue 1: Connection Timeout (ETIMEDOUT)

If you see:
```
Error: Connection timeout
code: 'ETIMEDOUT',
command: 'CONN'
```

**This is an SMTP-specific issue.** Solutions:

1. **Switch to Resend API** (recommended - no SMTP ports involved):
   ```env
   RESEND_API_KEY=re_YourKey
   FROM_EMAIL=onboarding@resend.dev
   ```

2. **Or fix SMTP**:
   - Check firewall allows outbound connections to port 465/587
   - Verify SMTP credentials are correct
   - Try port 587 instead of 465

### Issue 2: Missing Environment Variables

**For Resend API** (only one variable needed):
```bash
echo "RESEND_API_KEY: $RESEND_API_KEY"
echo "FROM_EMAIL: $FROM_EMAIL"
```

**For SMTP fallback** (all required):
```bash
echo "SMTP_HOST: $SMTP_HOST"
echo "SMTP_PORT: $SMTP_PORT"
echo "SMTP_USER: $SMTP_USER"
echo "SMTP_PASS: $SMTP_PASS (length: ${#SMTP_PASS})"
```

**Error if neither configured**:
```
No email service configured. Set either RESEND_API_KEY or SMTP credentials.
```

### Issue 3: Railway/Deployment Configuration

**Setting up on Railway:**

1. Go to your Railway project
2. Click on Variables tab
3. Add **either** Resend API **or** SMTP variables:

**Resend (Recommended)**:
```
RESEND_API_KEY=re_YourAPIKey
FROM_EMAIL=onboarding@resend.dev
```

**SMTP (Fallback)**:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your@gmail.com
```

4. Redeploy after adding variables

### Issue 4: Resend API Errors

**"Domain not verified" error**:
- For testing: Use `FROM_EMAIL=onboarding@resend.dev`
- For production: Verify your domain at https://resend.com/domains

**"Invalid API key" error**:
- Check your API key is correct (starts with `re_`)
- Generate a new key at https://resend.com/api-keys

## Debugging with Console Logs

The code includes comprehensive logging showing which method is being used:

### Successful Resend API Example:
```
📧 [MAILER] Starting OTP email send process
📧 [MAILER] Recipient: user@example.com
📧 [MAILER] Available methods: { resend: true, smtp: false }
📧 [MAILER] Using Resend API
✅ [MAILER] Email sent via Resend in 245 ms
📧 [MAILER] Message ID: abc123...
```

### Resend with SMTP Fallback Example:
```
📧 [MAILER] Available methods: { resend: true, smtp: true }
📧 [MAILER] Using Resend API
❌ [MAILER] Resend failed: Domain not verified
🔄 [MAILER] Falling back to SMTP...
📧 [MAILER] Using SMTP (nodemailer fallback)
✅ [MAILER] Email sent via SMTP in 1024 ms
```

### Error Indicators:
- **❌ No email service configured**: Neither Resend nor SMTP is set up
- **❌ Resend failed + SMTP failed**: Both methods failed - check logs for specific errors
- **❌ SMTP verification failed**: SMTP connection/auth issue (firewall, credentials)

## Quick Fix Checklist

### For Resend API (Recommended):
- [ ] `RESEND_API_KEY` is set (starts with `re_`)
- [ ] `FROM_EMAIL` is set (use `onboarding@resend.dev` for testing)
- [ ] API key is valid (check at https://resend.com/api-keys)
- [ ] For production: Domain is verified at https://resend.com/domains

### For SMTP Fallback:
- [ ] All SMTP variables set: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- [ ] Using Gmail with app password (not regular password)
- [ ] `FROM_EMAIL` matches `SMTP_USER` (for Gmail)
- [ ] Port 465 or 587 is not blocked by firewall

### General:
- [ ] Restarted application after changing environment variables
- [ ] Check console logs for detailed error messages
- [ ] Verified variables are set in Railway (if deployed)

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

## Email Sending Architecture

The system uses a **smart fallback strategy**:

```
Request OTP
    ↓
Check configured methods
    ↓
Has RESEND_API_KEY?
    ├─ YES → Try Resend API (HTTP)
    │        ├─ SUCCESS → Done ✅
    │        └─ FAIL → Has SMTP config?
    │                  ├─ YES → Try SMTP
    │                  │        ├─ SUCCESS → Done ✅
    │                  │        └─ FAIL → Error ❌
    │                  └─ NO → Error ❌
    └─ NO → Has SMTP config?
           ├─ YES → Try SMTP
           │        ├─ SUCCESS → Done ✅
           │        └─ FAIL → Error ❌
           └─ NO → Error: No email service configured ❌
```

## Still Having Issues?

### Quick Debugging Steps:

1. **Check which methods are available**:
   - Look for log: `📧 [MAILER] Available methods: { resend: X, smtp: Y }`
   - Both false? No email service is configured

2. **For Resend issues**:
   - Verify API key at https://resend.com/api-keys
   - Try using `onboarding@resend.dev` for `FROM_EMAIL`
   - Check Resend dashboard for error details

3. **For SMTP issues**:
   - Verify all 4 variables are set (HOST, PORT, USER, PASS)
   - Check firewall allows outbound connections
   - For Gmail: Confirm using app password, not account password
   - Try port 587 instead of 465

4. **For both failing**:
   - Restart application after setting variables
   - Check Railway/deployment platform for variable typos
   - Review full console logs for specific error messages

### Recommended Setup by Environment:

**Development/Testing**:
```env
RESEND_API_KEY=re_test_key
FROM_EMAIL=onboarding@resend.dev
```

**Production**:
```env
RESEND_API_KEY=re_production_key
FROM_EMAIL=noreply@yourdomain.com  # (verified domain)
```

**Production with SMTP Backup**:
```env
# Primary: Resend
RESEND_API_KEY=re_production_key
FROM_EMAIL=noreply@yourdomain.com

# Fallback: Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=backup@gmail.com
SMTP_PASS=app-password-here
```
