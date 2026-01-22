# Email OTP Authentication - Quick Start Guide

## 🚀 What You Have Now

Your ThesisTrack application now uses **Gmail-based OTP authentication** for user login.

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required)
3. Search **"App passwords"** → Select **"Mail"** → Click **Generate**
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update .env File

Replace the placeholder values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=abcd_efgh_ijkl_mnop
OTP_TTL_MIN=10
```

**Example:**
```env
SMTP_USER=thesistrack.service@gmail.com
SMTP_PASS=xyzw abcd efgh ijkl
```

### Step 3: Test It

```bash
# Restart your app
npm run dev

# Visit http://localhost:5173/login
# Enter your email
# Check inbox for OTP
# Login! ✅
```

---

## 🎯 How Users Login

```
1. Visit /login
2. Enter email address
3. Click "Send Login Code"
4. Check email inbox
5. Enter 6-digit OTP
6. Click "Verify & Login"
7. Redirected to dashboard ✅
```

---

## 🔧 Development Mode

**If SMTP not configured:**
- OTP printed in console
- OTP shown in browser UI
- Still validates properly

**Console Output:**
```
📧 Development OTP: 742901
```

**Browser Shows:**
```
Development Mode: Your OTP is 742901
```

---

## 📧 Email Template

Users receive this email:

```
Subject: Your ThesisTrack Login OTP

ThesisTrack Login Verification

Your one-time password (OTP) is:

  ┌──────────┐
  │ 742901   │
  └──────────┘

This OTP will expire in 10 minutes.

If you didn't request this, please ignore this email.
```

---

## 🔐 Security Features

✅ **Bcrypt-hashed OTP storage**  
✅ **10-minute expiration**  
✅ **Maximum 5 attempts per OTP**  
✅ **Auto-cleanup of expired codes**  
✅ **SSL/TLS email transport**  
✅ **Email format validation**  

---

## 📦 New API Endpoints

### Request OTP
```http
POST /api/auth/request-otp
Content-Type: application/x-www-form-urlencoded

email=user@example.com
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/x-www-form-urlencoded

email=user@example.com
otp=742901
```

---

## 🎨 Updated UI

### Login Page Features
- Email input with icon
- Professional OTP field (centered, letter-spaced)
- Loading states
- Error messages with attempt counter
- Shows destination email

---

## 🐛 Troubleshooting

### Email Not Sending?

**Check:**
1. ✅ Gmail App Password (not regular password)
2. ✅ 2-Step Verification enabled
3. ✅ Correct email in `SMTP_USER`
4. ✅ No spaces in `SMTP_PASS`

**Still not working?**
- Check console for errors
- Use development mode OTP (shown in UI)

### OTP Validation Failing?

**Check:**
1. ✅ Email matches request
2. ✅ Code entered correctly
3. ✅ Less than 10 minutes passed
4. ✅ Fewer than 5 attempts made

---

## 📊 Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `NO_OTP` | No code requested | Request new OTP |
| `EXPIRED` | >10 minutes passed | Request new OTP |
| `LOCKED` | >5 wrong attempts | Request new OTP |
| `INVALID` | Wrong code | Try again (shows attempts left) |

---

## 🚀 Production Deployment

### Required

1. Set environment variables:
   ```env
   SMTP_USER=production@yourdomain.com
   SMTP_PASS=your_app_password
   ```

2. Verify email deliverability

### Recommended

- **Use SendGrid** (100 free emails/day, better deliverability)
- **Add rate limiting** (max 3 OTP requests/hour per email)
- **Monitor email logs**

---

## 📁 Files Modified

### New Files
- `app/lib/mailer.server.ts`
- `app/lib/otp-store.server.ts`
- `app/routes/api.auth.request-otp.ts`
- `app/routes/api.auth.verify-otp.ts`

### Updated Files
- `app/routes/login.tsx`
- `app/routes/dashboard.tsx`
- `app/lib/storage.ts`
- `app/lib/auth.ts`

---

## 📚 Full Documentation

- **EMAIL_LOGIN_SETUP.md** - Complete setup guide
- **MIGRATION_TO_EMAIL_LOGIN.md** - Migration details
- **README_EMAIL_AUTH.md** - This quick start

---

## ✅ Status

- ✅ Packages installed
- ✅ API routes created
- ✅ Email service configured
- ✅ UI updated
- ✅ Type checking passed
- ✅ Build successful
- ✅ Ready for testing

---

## 🎉 You're All Set!

Just configure your Gmail SMTP credentials and you're ready to go!

**Need help?** Check **EMAIL_LOGIN_SETUP.md** for detailed instructions.
