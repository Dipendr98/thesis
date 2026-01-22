# Admin Login Troubleshooting Guide

## Current Situation

You're seeing the **Gmail SMTP authentication error** when trying to log in. This is expected because Gmail App Password is not configured.

---

## ✅ **Quick Solution: Use Development Mode**

**Good news:** The app works **WITHOUT Gmail setup** in development mode!

### How to Log In Now

1. **Go to Login Page**: `/login`

2. **Enter Your Email**: `admin@example.com` (or any email)

3. **Click "Send Login Code"**

4. **Look at Server Console** (terminal where `npm run dev` is running):
   ```
   📧 OTP for admin@example.com: 742901
   ```

5. **Look at Browser UI** (if in development):
   - You should see: `Development Mode: Your OTP is 742901`

6. **Enter the OTP**: Copy the 6-digit code from console/browser

7. **Click "Verify & Login"**

8. ✅ **You're Logged In!**

---

## 🔍 Where to Find the OTP

### Option 1: Server Console (Terminal)

When you click "Send Login Code", check your terminal:

```bash
Email sending failed: Error: Invalid login: 535-5.7.8 ...
📧 OTP for admin@example.com: 742901
```

**The OTP is:** `742901` (your code will be different)

---

### Option 2: Browser UI

The login page should show the OTP in the browser during development:

```
Development Mode
Your OTP is: 742901
(Email service unavailable - using console OTP)
```

---

## 🎯 Step-by-Step Login Example

### Scenario: Admin wants to access admin panel

**Step 1: Visit Login**
```
URL: http://localhost:5173/login
```

**Step 2: Enter Email**
```
Input: admin@thesistrack.com
Click: "Send Login Code"
```

**Step 3: Check Console**
```
Terminal Output:
---
Email sending failed: Error: Invalid login: 535-5.7.8 ...
📧 OTP for admin@thesistrack.com: 742901
---
```

**Step 4: Enter OTP**
```
Input: 742901
Click: "Verify & Login"
```

**Step 5: Access Dashboard**
```
✅ Redirected to: /dashboard
```

**Step 6: Access Admin Panel**
```
Go to: /admin
```

---

## 🔐 Admin Panel Access

### Current Admin Setup

The admin panel uses **hardcoded admin emails** for authorization:

**Admin Emails:**
```typescript
const ADMIN_EMAILS = [
  "admin@example.com",
  "admin@thesistrack.com",
  "superadmin@thesistrack.com"
];
```

### How to Add Yourself as Admin

**Option 1: Use Existing Admin Email**

Log in with one of these:
- `admin@example.com`
- `admin@thesistrack.com`
- `superadmin@thesistrack.com`

**Option 2: Add Your Email to Admin List**

1. Open: `app/routes/_admin.tsx`
2. Find: `ADMIN_EMAILS` array
3. Add your email:
   ```typescript
   const ADMIN_EMAILS = [
     "admin@example.com",
     "youremail@gmail.com", // ← Add this
   ];
   ```
4. Save file
5. Log in with your email

---

## 🧪 Testing Full Flow

### Test Case 1: Normal User Login

```
1. Go to: /login
2. Enter: john@example.com
3. Console shows: 📧 OTP for john@example.com: 123456
4. Enter OTP: 123456
5. Click: "Verify & Login"
6. ✅ Redirected to: /dashboard
7. ❌ Cannot access: /admin (not admin)
```

### Test Case 2: Admin Login

```
1. Go to: /login
2. Enter: admin@example.com
3. Console shows: 📧 OTP for admin@example.com: 789012
4. Enter OTP: 789012
5. Click: "Verify & Login"
6. ✅ Redirected to: /dashboard
7. ✅ Can access: /admin (is admin)
```

---

## 🚫 Common Issues

### Issue 1: "No OTP Found"

**Error:** `No OTP found. Please request a new one.`

**Cause:** You didn't click "Send Login Code" OR OTP expired (10 min)

**Fix:**
```
1. Go back to login
2. Enter email again
3. Click "Send Login Code"
4. Check console for NEW OTP
5. Enter the NEW code
```

---

### Issue 2: "Invalid OTP"

**Error:** `Invalid OTP. 4 attempts remaining.`

**Cause:** Wrong code entered

**Fix:**
```
1. Check console for EXACT code
2. Make sure it's 6 digits
3. Copy-paste to avoid typos
4. Enter again
```

---

### Issue 3: "OTP Expired"

**Error:** `OTP has expired. Please request a new one.`

**Cause:** More than 10 minutes passed since OTP was sent

**Fix:**
```
1. Click "Back"
2. Click "Send Login Code" again
3. Check console for NEW OTP
4. Enter within 10 minutes
```

---

### Issue 4: "Too Many Attempts"

**Error:** `Too many attempts. Please request a new OTP.`

**Cause:** Entered wrong code 5+ times

**Fix:**
```
1. Click "Back"
2. Click "Send Login Code" to generate NEW OTP
3. Check console for correct code
4. Enter carefully
```

---

## 📧 To Enable Real Email (Optional)

If you want actual emails instead of console OTPs:

### Quick Setup (Gmail)

1. **Enable 2-Step Verification**:
   - https://myaccount.google.com/security

2. **Create App Password**:
   - https://myaccount.google.com/apppasswords
   - Name: ThesisTrack
   - Copy: 16-character password

3. **Update `.env`**:
   ```env
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=your-app-password-here
   ```

4. **Restart app**:
   ```bash
   npm run dev
   ```

5. **Test**: Real emails will be sent! ✅

**Full guide:** See `GMAIL_SETUP_GUIDE.md`

---

## 🎯 Summary

### Current State
- ✅ Login works with console OTPs
- ✅ Admin panel accessible
- ❌ Real emails not sent (SMTP not configured)

### To Log In Now
1. Visit `/login`
2. Enter any email
3. Check server console for OTP
4. Enter the OTP
5. Login successful ✅

### To Access Admin Panel
1. Log in with admin email:
   - `admin@example.com`
   - `admin@thesistrack.com`
   - OR add your email to `ADMIN_EMAILS` array

2. Navigate to: `/admin`

### To Enable Email
- Follow `GMAIL_SETUP_GUIDE.md`
- Not required for development/testing

---

## 🔑 Quick Admin Access

```bash
# 1. Start app
npm run dev

# 2. Open browser
http://localhost:5173/login

# 3. Enter
Email: admin@example.com

# 4. Check console
📧 OTP for admin@example.com: 123456

# 5. Enter OTP
123456

# 6. Login → Go to
http://localhost:5173/admin

# ✅ Admin panel loaded!
```

---

**Your app is working perfectly! Gmail setup is optional. Use console OTPs for now. 🚀**
