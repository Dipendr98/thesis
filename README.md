# ThesisTrack - Thesis Order Management System

## 📋 Overview

ThesisTrack is a comprehensive web application for managing thesis orders, user authentication, and administrative tasks. Built with React Router v7, TypeScript, and modern web technologies.

---

## ✨ Features

### 🔐 Authentication
- **Email-based OTP login** (no passwords!)
- Secure 6-digit verification codes
- Development mode with console OTPs
- Production-ready with Nodemailer (Gmail SMTP)
- 10-minute OTP expiration
- Rate limiting (5 attempts per OTP)

### 👥 User Management
- Automatic user creation on first login
- Email-based user identification
- Role-based access control (Admin/User)
- User dashboard with order history

### 📝 Order Management
- Place thesis orders with details
- Track order status (Pending/Completed/Rejected)
- View order history
- Admin approval workflow

### 🔧 Admin Panel
- View all users
- Manage all orders
- Update pricing plans
- Real-time statistics
- Secure admin-only access

### 💰 Pricing
- Flexible pricing plans (Basic/Standard/Premium)
- Customizable pricing per academic level
- Public pricing page
- Admin pricing management

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
http://localhost:5173
```

---

## 🔑 Login Guide

### Quick Login (Works Immediately!)

**No setup required - works right now!**

1. **Open login page**: `http://localhost:5173/login`
2. **Enter email**: `admin@example.com` (or any email)
3. **Click**: "Send Login Code"
4. **Check console**: Look for `📧 OTP for admin@example.com: 123456`
5. **Check browser**: Development mode shows OTP in UI
6. **Enter OTP**: Copy the 6-digit code
7. **Click**: "Verify & Login"
8. **Done!** ✅ Redirected to dashboard

### Admin Access

**Admin emails:**
- `admin@example.com`
- `admin@thesistrack.com`
- `superadmin@thesistrack.com`

**After login, visit**: `http://localhost:5173/admin`

---

## 📁 Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── layout/         # Header, footer, navigation
│   └── ui/             # UI library (buttons, cards, etc.)
├── routes/             # Route modules
│   ├── _public.*       # Public pages (home, pricing, about)
│   ├── _admin.*        # Admin panel pages
│   ├── login.tsx       # Email OTP login
│   ├── dashboard.tsx   # User dashboard
│   └── order.tsx       # Order placement form
├── lib/                # Utilities and services
│   ├── auth.ts         # Authentication helpers
│   ├── storage.ts      # Data storage (localStorage)
│   ├── mailer.server.ts # Email sending (Nodemailer)
│   └── otp-store.server.ts # OTP management
├── styles/             # Global styles and design tokens
│   ├── theme.css       # Design system
│   ├── tokens/         # Color, spacing, typography
│   └── global.css      # Global styles
└── routes.ts           # Route configuration
```

---

## 🎨 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router v7** - Routing & framework
- **CSS Modules** - Component styling
- **Radix UI** - Accessible components
- **Lucide React** - Icon library

### Backend (Server-Side)
- **Node.js** - Runtime
- **Nodemailer** - Email sending
- **bcryptjs** - OTP hashing

### Data Storage
- **LocalStorage** - Client-side data
- **In-memory** - OTP storage (development)

---

## 📧 Email Configuration (Optional)

**Current State:** ✅ Works without email setup (development mode)

**To enable real emails:**

### Quick Setup (Gmail)

1. **Enable 2-Step Verification**
   - https://myaccount.google.com/security

2. **Create App Password**
   - https://myaccount.google.com/apppasswords
   - App name: ThesisTrack
   - Copy 16-character password

3. **Update `.env`**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=your-app-password
   OTP_TTL_MIN=10
   ```

4. **Restart app**
   ```bash
   npm run dev
   ```

**Detailed guide**: See `GMAIL_SETUP_GUIDE.md`

---

## 📖 Documentation

- **[USER_LOGIN_GUIDE.md](USER_LOGIN_GUIDE.md)** - How to log in (step-by-step)
- **[ADMIN_LOGIN_TROUBLESHOOTING.md](ADMIN_LOGIN_TROUBLESHOOTING.md)** - Admin access & troubleshooting
- **[GMAIL_SETUP_GUIDE.md](GMAIL_SETUP_GUIDE.md)** - Email setup instructions
- **[EMAIL_LOGIN_SETUP.md](EMAIL_LOGIN_SETUP.md)** - Comprehensive email auth guide
- **[MIGRATION_TO_EMAIL_LOGIN.md](MIGRATION_TO_EMAIL_LOGIN.md)** - Migration details

---

## 🔐 Security Features

### Implemented ✅
- Bcrypt-hashed OTP storage
- Time-limited codes (10 minutes)
- Rate limiting (5 attempts)
- Auto-cleanup of expired codes
- Email validation
- SSL/TLS email transport
- Admin role verification

### Production Recommendations 🔒
- Add IP-based rate limiting
- Use Redis for OTP storage
- Enable CAPTCHA on OTP request
- Add email logging/monitoring
- Implement session management
- Add CSRF protection

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Type checking
npm run typecheck    # Check TypeScript types

# Linting
npm run lint         # Lint code
```

---

## 🎯 Key Features Explained

### Authentication Flow

```
User enters email
    ↓
System generates 6-digit OTP
    ↓
OTP hashed with bcrypt
    ↓
Email sent (or console in dev mode)
    ↓
User enters OTP
    ↓
System validates hash
    ↓
Create/retrieve user
    ↓
Login success ✅
```

### Development Mode

When email fails (SMTP not configured):
- ✅ OTP logged to console
- ✅ OTP shown in browser UI
- ✅ System works normally
- ✅ Perfect for testing

### Order Workflow

```
User places order
    ↓
Order saved (Pending status)
    ↓
Admin reviews in admin panel
    ↓
Admin approves/rejects
    ↓
User sees updated status
```

---

## 🔄 Data Flow

### User Data
```
Storage: localStorage
Schema: {
  id: string
  email: string
  mobile?: string (legacy)
  name?: string
  createdAt: string
}
```

### Order Data
```
Storage: localStorage
Schema: {
  id: string
  userId: string
  userEmail: string
  title: string
  category: string
  academicLevel: string
  plan: string
  totalPrice: number
  status: "Pending" | "Completed" | "Rejected"
  createdAt: string
}
```

### OTP Data (Server-Side)
```
Storage: In-memory Map
Schema: {
  hash: string (bcrypt)
  expiresAt: number
  attemptsLeft: number
}
```

---

## 🌐 Routes

### Public Routes
```
/                    - Home page
/about              - About page
/contact            - Contact page
/pricing            - Pricing page
/login              - Email OTP login
```

### Protected Routes (Login Required)
```
/dashboard          - User dashboard
/order              - Order placement form
```

### Admin Routes (Admin Only)
```
/admin              - Admin overview
/admin/orders       - Manage orders
/admin/users        - View users
/admin/pricing      - Update pricing
/admin/login        - Admin login (legacy)
```

### API Routes (Server-Side)
```
POST /api/auth/request-otp   - Request OTP
POST /api/auth/verify-otp    - Verify OTP
```

---

## 🎨 Design System

### Colors
- **Neutral**: Gray scale
- **Accent**: Primary brand color (indigo)
- **Success**: Green for positive actions
- **Error**: Red for warnings/errors

### Typography
- **Display**: Large headings
- **Heading**: Section titles
- **Body**: Regular text
- **Caption**: Small text
- **Code**: Monospace

### Spacing
- Consistent spacing scale (4px - 64px)
- Variable: `--space-[1-9]`

### Components
- Pre-built UI library in `app/components/ui/`
- Accessible (Radix UI based)
- Customizable with CSS Modules

---

## 🐛 Troubleshooting

### Login Issues

**Problem:** "Email sending failed" error

**Solution:** 
- ✅ This is expected in development
- ✅ Check console for OTP
- ✅ Check browser UI for OTP
- ✅ System works perfectly without email setup

---

**Problem:** "Invalid OTP"

**Solution:**
- Check console for EXACT code
- Make sure it's 6 digits
- No spaces
- Copy-paste to avoid typos

---

**Problem:** "OTP expired"

**Solution:**
- Click "Back"
- Request new code
- OTPs expire after 10 minutes

---

**Problem:** Can't access admin panel

**Solution:**
- Log in with admin email:
  - `admin@example.com`
  - `admin@thesistrack.com`
  - `superadmin@thesistrack.com`
- OR add your email to `ADMIN_EMAILS` in `app/routes/_admin.tsx`

---

### Build Issues

**Problem:** Type errors

**Solution:**
```bash
npm run typecheck
```

---

**Problem:** Missing dependencies

**Solution:**
```bash
rm -rf node_modules
npm install
```

---

## 📊 Current Status

### ✅ Working Features
- Email OTP authentication
- User registration (automatic)
- User dashboard
- Order placement
- Admin panel
- Order management
- User management
- Pricing management
- Development mode (console OTPs)

### 🔄 Optional Enhancements
- Real email sending (Gmail/SendGrid)
- Redis OTP storage
- Rate limiting by IP
- CAPTCHA protection
- Session management
- Push notifications
- Email templates (HTML)

---

## 🤝 Development Workflow

### Adding New Features

1. **Create route**: `app/routes/feature.tsx`
2. **Add to routes**: Update `app/routes.ts`
3. **Create components**: `app/components/feature/`
4. **Add styles**: `feature.module.css`
5. **Test**: `npm run dev`
6. **Type check**: `npm run typecheck`

### Styling Guidelines

- Use CSS Modules for component styles
- Reference design tokens from `theme.css`
- Keep consistent spacing/colors
- Mobile-first responsive design

---

## 📝 Environment Variables

```env
# Email (Optional - works without these)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# OTP Configuration
OTP_TTL_MIN=10

# Node Environment
NODE_ENV=development
```

---

## 🎉 Getting Started Summary

### For Development (Right Now)

```bash
# 1. Install & Run
npm install && npm run dev

# 2. Login
Open: http://localhost:5173/login
Email: admin@example.com
Check console for OTP
Enter OTP → Login ✅

# 3. Explore
Dashboard: http://localhost:5173/dashboard
Admin Panel: http://localhost:5173/admin
```

### For Production

1. Set up Gmail SMTP or SendGrid
2. Update environment variables
3. Build: `npm run build`
4. Deploy to hosting (Vercel, Netlify, etc.)

---

## 📞 Support

**Issues?**
- Check `USER_LOGIN_GUIDE.md` for login help
- Check `ADMIN_LOGIN_TROUBLESHOOTING.md` for admin access
- Check `GMAIL_SETUP_GUIDE.md` for email setup

**Quick Help:**
- Login not working? → Check console for OTP
- Admin access? → Use `admin@example.com`
- Email errors? → Normal in dev mode, use console OTP

---

## 🚀 What's Next?

### Recommended Next Steps:

1. **Test the app** (works now without setup!)
2. **Explore admin panel** (admin@example.com)
3. **Place test orders**
4. **Optional: Set up Gmail** (for real emails)
5. **Customize branding** (colors, logo, content)
6. **Deploy to production**

---

## 📄 License

MIT License - Feel free to use for your thesis management needs!

---

**ThesisTrack is ready to use! Log in now with console OTPs. 🎉🚀**

**No setup required - just run and start using!**
