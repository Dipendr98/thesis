# Email OTP Login Setup Guide

## Overview

Your ThesisTrack application now uses **Email-based OTP authentication** instead of mobile phone login. Users receive a 6-digit code via email to log in securely.

---

## 🔧 **Configuration Required**

### Step 1: Set Up Gmail App Password

To send emails via Gmail, you need a Google App Password (NOT your regular Gmail password):

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification:**
   - Click "2-Step Verification" → Follow setup
   - Required before creating app passwords

3. **Create App Password:**
   - Search for "App passwords" in settings
   - Click "App passwords"
   - Select "Mail" → Generate
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

4. **Update Environment Variables:**

Replace these values in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=your_app_password_here
OTP_TTL_MIN=10
```

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=thesistrack@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
OTP_TTL_MIN=10
```

---

## 📧 **How It Works**

### User Flow

1. **User enters email** on login page
2. **System generates 6-digit OTP** (e.g., `742901`)
3. **Email sent** via Nodemailer/Gmail SMTP
4. **User receives email** with OTP code
5. **User enters OTP** on verification page
6. **System validates** and logs in user

### Security Features

- ✅ **Hashed Storage:** OTPs are bcrypt-hashed before storage
- ✅ **Time Limited:** Codes expire after 10 minutes (configurable)
- ✅ **Attempt Limits:** Maximum 5 attempts per OTP
- ✅ **Auto-Cleanup:** Expired/used codes are deleted
- ✅ **Email Validation:** Format checked before sending

---

## 🎯 **Development Mode**

If email sending fails (SMTP not configured), the system automatically:

1. **Logs OTP to console**
2. **Shows OTP in UI** for testing
3. **Still validates properly**

**Console Output:**
```
📧 Development OTP: 742901
```

**UI Display:**
```
Development Mode: Your OTP is 742901
(Email service unavailable - using console OTP)
```

---

## 🔐 **API Endpoints**

### 1. Request OTP

**Endpoint:** `POST /api/auth/request-otp`

**Request:**
```
email=user@example.com
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Response (Dev Mode):**
```json
{
  "success": true,
  "message": "OTP generated (check console)",
  "devMode": true,
  "otp": "742901"
}
```

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```
email=user@example.com
otp=742901
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-1234567890",
    "email": "user@example.com"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid OTP. 3 attempts remaining.",
  "attemptsLeft": 3
}
```

---

## 📊 **Database Schema**

### User Table (Updated)

```typescript
interface User {
  id: string;           // user-1234567890
  email: string;        // user@example.com
  mobile?: string;      // Optional (legacy)
  name?: string;        // Optional
  createdAt: string;    // ISO date
}
```

**Changes:**
- ✅ `email` is now primary identifier (was `mobile`)
- ✅ `mobile` is optional (for legacy support)
- ✅ New users created with email automatically

---

## 🎨 **UI Components**

### Login Page (`/login`)

**Features:**
- Email input with icon
- Loading states
- Error messages
- Development OTP display
- Back button on OTP step

**States:**
1. **Email Entry:**
   - Input: Email address
   - Button: "Send Login Code"

2. **OTP Verification:**
   - Input: 6-digit code
   - Shows email sent to
   - Button: "Verify & Login"
   - Button: "Back"

---

## 🔍 **Error Handling**

### Common Errors

| Error | Reason | Solution |
|-------|--------|----------|
| `NO_OTP` | No OTP requested | Click "Back" and request new code |
| `EXPIRED` | OTP older than 10 min | Request new code |
| `LOCKED` | Too many attempts (5+) | Request new code |
| `INVALID` | Wrong code entered | Try again (shows attempts left) |

### Email Sending Errors

If email fails to send:
- System logs error to console
- Falls back to development mode
- OTP shown in console/UI
- User can still proceed with testing

---

## 📦 **Installed Packages**

```json
{
  "dependencies": {
    "nodemailer": "^6.9.x",
    "bcryptjs": "^2.4.x"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.x",
    "@types/bcryptjs": "^2.4.x"
  }
}
```

---

## 🚀 **Files Created/Modified**

### New Files

- ✅ `app/lib/mailer.server.ts` - Email sending service
- ✅ `app/lib/otp-store.server.ts` - OTP storage & validation
- ✅ `app/routes/api.auth.request-otp.ts` - Request OTP endpoint
- ✅ `app/routes/api.auth.verify-otp.ts` - Verify OTP endpoint
- ✅ `EMAIL_LOGIN_SETUP.md` - This guide

### Modified Files

- ✅ `app/routes/login.tsx` - Email-based login UI
- ✅ `app/routes/login.module.css` - Updated styles
- ✅ `app/lib/storage.ts` - Added email support
- ✅ `app/lib/auth.ts` - Updated for email auth
- ✅ `app/routes.ts` - Added API routes
- ✅ `.env` - Added SMTP variables

---

## 🧪 **Testing**

### Test Scenario 1: Successful Login

1. Go to `/login`
2. Enter: `test@example.com`
3. Click "Send Login Code"
4. Check console for OTP (if dev mode)
5. Enter the 6-digit code
6. Click "Verify & Login"
7. ✅ Redirected to `/dashboard`

### Test Scenario 2: Invalid Email

1. Enter: `invalid-email`
2. Click "Send Login Code"
3. ❌ Error: "Please enter a valid email address"

### Test Scenario 3: Wrong OTP

1. Request OTP for email
2. Enter wrong code (e.g., `000000`)
3. Click "Verify & Login"
4. ❌ Error: "Invalid OTP. 4 attempts remaining."

### Test Scenario 4: Expired OTP

1. Request OTP
2. Wait 11 minutes (OTP_TTL_MIN + 1)
3. Enter the code
4. ❌ Error: "OTP has expired. Please request a new one."

---

## 🔐 **Security Best Practices**

### ✅ Implemented

1. **Hashed OTP Storage** - bcrypt with salt rounds = 10
2. **Time-Limited Codes** - 10-minute expiration
3. **Rate Limiting** - Max 5 attempts per OTP
4. **Auto-Cleanup** - Used/expired codes deleted
5. **Secure Transport** - SMTP over SSL/TLS (port 465)
6. **Email Validation** - Regex check before sending

### 🔒 Production Recommendations

1. **Add Rate Limiting:**
   ```typescript
   // Limit OTP requests per email
   // Max 3 requests per hour per email
   ```

2. **Use Redis for OTP Storage:**
   ```typescript
   // Replace in-memory Map with Redis
   // Better for multi-server deployments
   ```

3. **Add IP-based Rate Limiting:**
   ```typescript
   // Prevent abuse from single IP
   // Max 10 requests per hour per IP
   ```

4. **Enable Email Logging:**
   ```typescript
   // Track all sent emails
   // Monitor for abuse patterns
   ```

5. **Add CAPTCHA:**
   ```typescript
   // Protect OTP request endpoint
   // Prevent automated attacks
   ```

---

## 🌐 **Production Deployment**

### Environment Variables

Ensure these are set in your production environment:

```env
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=production_email@yourdomain.com
SMTP_PASS=your_production_app_password
OTP_TTL_MIN=10
```

### Email Service Alternatives

If Gmail doesn't work for production, consider:

1. **SendGrid** (Recommended)
   - 100 free emails/day
   - Better deliverability
   - Simple API

2. **Mailgun**
   - 5,000 free emails/month
   - Powerful analytics

3. **AWS SES**
   - Very cheap
   - Great for high volume

4. **Resend** (Modern)
   - React email templates
   - Developer-friendly

---

## 📞 **Support**

### Quick Debug Checklist

**Email not sending?**
- ✅ Check SMTP credentials in `.env`
- ✅ Verify Gmail 2FA enabled
- ✅ Confirm app password (not regular password)
- ✅ Check console for error messages

**OTP validation failing?**
- ✅ Verify email matches request
- ✅ Check code hasn't expired (10 min)
- ✅ Ensure code entered correctly
- ✅ Check attempts remaining

**User not created?**
- ✅ Check browser console for errors
- ✅ Verify localStorage accessible
- ✅ Check network tab for API responses

---

## 🎉 **Benefits Over Mobile Login**

| Feature | Mobile OTP | Email OTP |
|---------|-----------|-----------|
| **Cost** | SMS fees | Free (Gmail) |
| **Reliability** | Carrier dependent | Direct delivery |
| **International** | Expensive | Same cost |
| **Testing** | Needs real phone | Any email works |
| **Privacy** | Phone number required | Just email |
| **Delivery Speed** | 1-30 seconds | Instant |

---

## 📝 **Next Steps**

1. **Configure Gmail SMTP** credentials
2. **Test login flow** with real email
3. **Update branding** in email template
4. **Add custom domain** email (optional)
5. **Enable production monitoring**

---

**Your email authentication system is ready! Users can now log in securely with just their email address. 🚀**
