# Gmail SMTP Setup Guide - Fix "Username and Password not accepted" Error

## 🔴 Current Error

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

This means your Gmail App Password is **not configured correctly**.

---

## ✅ Solution: Set Up Gmail App Password (5 minutes)

### Step 1: Enable 2-Step Verification

1. Go to **Google Account Security**: https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow the setup process (SMS or authenticator app)
4. ✅ **Verify it's enabled** (should show "2-Step Verification is on")

---

### Step 2: Create App Password

1. **Go to App Passwords page**:
   - Direct link: https://myaccount.google.com/apppasswords
   - OR: Search "app passwords" in Google Account settings

2. **Create new app password**:
   - **App name:** Enter "ThesisTrack" (or any name)
   - Click **"Create"**

3. **Copy the 16-character password**:
   ```
   Example: abcd efgh ijkl mnop
   ```
   - **Important:** Copy it immediately (you won't see it again!)

---

### Step 3: Update Your Environment Variables

**Option A: Update in Dazl UI**

1. Click "Secrets" or "Environment Variables" in Dazl
2. Find `SMTP_USER` → Set to your **Gmail address**
3. Find `SMTP_PASS` → Set to the **16-character App Password**

**Option B: Update `.env` file directly**

Replace these values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_actual_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
OTP_TTL_MIN=10
```

**Real Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=john.doe@gmail.com
SMTP_PASS=xyzw abcd efgh ijkl
OTP_TTL_MIN=10
```

---

### Step 4: Restart Your App

```bash
# Stop the app (Ctrl+C)
# Start again
npm run dev
```

---

### Step 5: Test Login

1. Go to `/login`
2. Enter your email: `test@example.com`
3. Click "Send Login Code"
4. ✅ **Check your email inbox** for the OTP
5. Enter the OTP code
6. Click "Verify & Login"

---

## 🧪 Development Mode (Works WITHOUT Gmail Setup)

**Good news:** The app works **even without Gmail configured!**

### How It Works

If email sending fails (SMTP not configured):

1. **OTP logged to server console**:
   ```
   📧 OTP for test@example.com: 742901
   ```

2. **OTP shown in browser** (development mode):
   ```
   Development Mode: Your OTP is 742901
   (Email service unavailable - using console OTP)
   ```

3. **Enter the OTP** from console/browser → Login works ✅

### To Use Development Mode

Just use the app as normal:
- Enter email
- Look at **server console** or **browser UI** for OTP
- Enter the code
- Login works!

---

## ❌ Common Mistakes

### 1. Using Regular Gmail Password ❌

```env
SMTP_PASS=myGmailPassword123  # ❌ WRONG
```

**Fix:** Use App Password instead:
```env
SMTP_PASS=abcd efgh ijkl mnop  # ✅ CORRECT (16 chars)
```

---

### 2. Spaces in App Password ❌

```env
SMTP_PASS=abcd efgh ijkl mnop  # ❌ WRONG (with spaces)
```

**Fix:** Remove all spaces:
```env
SMTP_PASS=abcdefghijklmnop  # ✅ CORRECT (no spaces)
```

---

### 3. 2-Step Verification Not Enabled ❌

App Passwords only work if **2-Step Verification is ON**.

**Fix:** Enable 2FA first → Then create App Password

---

### 4. Wrong Email Address ❌

```env
SMTP_USER=someone_else@gmail.com  # ❌ Not your email
```

**Fix:** Use YOUR actual Gmail:
```env
SMTP_USER=youremail@gmail.com  # ✅ Your Gmail
```

---

## 🔍 Troubleshooting

### Check 1: Is 2-Step Verification Enabled?

Go to: https://myaccount.google.com/security

✅ Should show: **"2-Step Verification is on"**

---

### Check 2: Did You Copy App Password Correctly?

- Should be **16 characters**
- May have spaces when shown: `abcd efgh ijkl mnop`
- **Remove spaces** when pasting: `abcdefghijklmnop`

---

### Check 3: Are Environment Variables Loaded?

Add this to your code temporarily:

```typescript
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);
```

Should show:
```
SMTP_USER: youremail@gmail.com
SMTP_PASS exists: true
```

---

### Check 4: Server Restart

After changing `.env`, always restart:

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🚀 Alternative: Use SendGrid Instead (Free)

If Gmail doesn't work, try **SendGrid** (easier setup):

### 1. Create SendGrid Account

- Sign up: https://sendgrid.com
- Free tier: **100 emails/day**

### 2. Get API Key

- Go to: **Settings** → **API Keys**
- Create API Key → Copy it

### 3. Update Code

Replace `app/lib/mailer.server.ts`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendOtpEmail(to: string, otp: string, ttlMin = 10) {
  await sgMail.send({
    to,
    from: 'noreply@yourdomain.com', // Verified sender
    subject: 'Your Login OTP',
    text: `Your OTP is ${otp}. Expires in ${ttlMin} minutes.`,
    html: `<p>Your OTP is <b>${otp}</b></p>`,
  });
}
```

### 4. Install Package

```bash
npm install @sendgrid/mail
```

### 5. Update `.env`

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

---

## 📝 Summary

### Current Status
- ❌ Gmail SMTP not configured → Email sending fails
- ✅ Development mode works → OTP shown in console

### To Enable Email Sending
1. Enable 2-Step Verification on Gmail
2. Create App Password (16 characters)
3. Update `SMTP_USER` and `SMTP_PASS` in `.env`
4. Restart app
5. Test login → Email sent ✅

### For Testing Now
- Use development mode (no setup needed)
- Check console for OTP
- Enter code → Login works ✅

---

## 🎯 Quick Setup (Copy-Paste)

```bash
# 1. Go to Gmail settings
# https://myaccount.google.com/security
# Enable 2-Step Verification

# 2. Create App Password
# https://myaccount.google.com/apppasswords
# Name: ThesisTrack
# Copy password: abcdefghijklmnop

# 3. Update .env
SMTP_USER=youremail@gmail.com
SMTP_PASS=abcdefghijklmnop

# 4. Restart
npm run dev

# 5. Test
# Go to /login → Enter email → Check inbox ✅
```

---

**Need help? Check the console for OTP and use development mode! The app works without Gmail setup. 🚀**
