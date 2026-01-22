# Railway Deployment Guide for ThesisTrack

This guide will help you deploy ThesisTrack to Railway with OTP authentication using Nodemailer.

## Prerequisites

1. A [Railway account](https://railway.app/) (sign up with GitHub)
2. Railway CLI installed (optional): `npm i -g @railway/cli`
3. A Gmail account with App Password configured (see GMAIL_SETUP_GUIDE.md)
4. Supabase project set up (see SUPABASE_SETUP.md)

## Step 1: Prepare Your Repository

The repository is already configured with:
- ✅ `Dockerfile` - Containerization setup
- ✅ `railway.json` - Railway configuration
- ✅ `.dockerignore` - Build optimization

## Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard (Recommended)

1. **Go to [Railway Dashboard](https://railway.app/dashboard)**

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub account
   - Select your repository: `Dipendr98/thesis`
   - Select branch: `claude/deploy-railway-otp-auth-ZBFvO` (or your main branch)

3. **Railway will automatically detect the Dockerfile and start building**

### Option B: Deploy via Railway CLI

```bash
# Login to Railway
railway login

# Link to your project (or create new)
railway link

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In Railway Dashboard, go to your project > Variables tab and add the following:

### Required Environment Variables

```env
# Node Environment
NODE_ENV=production

# Supabase Configuration
SUPABASE_PROJECT_URL=https://loegrisrrrqyaixglljy.supabase.co
SUPABASE_API_KEY=sb_publishable_30mbXibFDKN2rXZXQlkDGQ_j_M5ZWOZ
VITE_SUPABASE_PROJECT_URL=https://loegrisrrrqyaixglljy.supabase.co
VITE_SUPABASE_API_KEY=sb_publishable_30mbXibFDKN2rXZXQlkDGQ_j_M5ZWOZ

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here

# OTP Configuration
OTP_TTL_MIN=10

# Application URL (update after Railway assigns domain)
APP_URL=https://your-app.railway.app
```

### How to Add Variables in Railway:

1. In Railway Dashboard, go to your service
2. Click on "Variables" tab
3. Click "New Variable"
4. Add each variable name and value
5. Railway will automatically redeploy after adding variables

## Step 4: Set Up Supabase Database

1. **Go to your Supabase project SQL Editor**
   - URL: https://supabase.com/dashboard/project/loegrisrrrqyaixglljy/sql

2. **Run the schema SQL**
   ```bash
   # Copy the contents of supabase-schema.sql
   # Paste into Supabase SQL Editor
   # Click "Run"
   ```

3. **Verify tables were created**
   - Check Table Editor for: users, admins, orders, pricing_plans, qr_settings

## Step 5: Configure Gmail App Password

If you haven't already:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security > 2-Step Verification > App passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)
6. Add it as `SMTP_PASS` in Railway environment variables

See `GMAIL_SETUP_GUIDE.md` for detailed instructions.

## Step 6: Update Application URL

After Railway assigns your domain:

1. Copy your Railway domain (e.g., `https://your-app.railway.app`)
2. Update the `APP_URL` environment variable in Railway
3. Railway will automatically redeploy

## Step 7: Verify Deployment

1. **Open your Railway app URL**
   - You should see the ThesisTrack homepage

2. **Test OTP Login**
   - Go to `/login`
   - Enter your email
   - Check your email for OTP code
   - Enter the OTP to login

3. **Check Railway Logs**
   ```bash
   # Via CLI
   railway logs

   # Or in Dashboard: Service > Deployments > View Logs
   ```

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors during build
```bash
# Run locally to check errors
npm run typecheck
```

**Issue**: Docker build fails
```bash
# Test Docker build locally
docker build -t thesis-track .
docker run -p 3000:3000 thesis-track
```

### Email Not Sending

**Issue**: OTP emails not arriving

1. Check Railway logs for email errors:
   ```bash
   railway logs --filter "mailer"
   ```

2. Verify SMTP credentials:
   - Check `SMTP_USER` is correct email
   - Check `SMTP_PASS` is App Password (not regular password)
   - Ensure `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=465`

3. Check Gmail account:
   - Verify 2FA is enabled
   - Regenerate App Password if needed
   - Check "Less secure app access" is not blocking

### Database Connection Issues

**Issue**: Cannot connect to Supabase

1. Verify environment variables:
   ```bash
   railway variables
   ```

2. Check Supabase project is active:
   - Go to Supabase dashboard
   - Verify project status

3. Test connection locally:
   ```bash
   # Create .env.local with production credentials
   npm run dev
   ```

### Port Issues

**Issue**: App not accessible

Railway automatically sets the `PORT` environment variable. The Dockerfile is configured to use port 3000, but Railway will handle port mapping automatically.

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `SUPABASE_PROJECT_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_API_KEY` | Supabase anon/public key | `sb_publishable_xxx` |
| `VITE_SUPABASE_PROJECT_URL` | Client-side Supabase URL | Same as above |
| `VITE_SUPABASE_API_KEY` | Client-side Supabase key | Same as above |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `465` |
| `SMTP_USER` | SMTP username (email) | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP app password | `xxxx xxxx xxxx xxxx` |
| `OTP_TTL_MIN` | OTP expiration time | `10` |
| `APP_URL` | Application URL | `https://your-app.railway.app` |

## Monitoring

### View Logs
```bash
# Via CLI
railway logs

# Follow logs in real-time
railway logs --tail
```

### Metrics

In Railway Dashboard:
- Go to your service
- Click "Metrics" tab
- View CPU, Memory, Network usage

## Updating Your Deployment

### Deploy New Changes

```bash
# Commit your changes
git add .
git commit -m "Your changes"
git push origin claude/deploy-railway-otp-auth-ZBFvO

# Railway will automatically detect and deploy
```

### Manual Redeploy

In Railway Dashboard:
- Go to your service
- Click "Deployments" tab
- Click "Redeploy" on latest deployment

## Custom Domain (Optional)

1. In Railway Dashboard, go to your service
2. Click "Settings" tab
3. Scroll to "Domains"
4. Click "Add Domain"
5. Follow instructions to configure DNS

## Cost Estimation

Railway offers:
- **Hobby Plan**: $5/month for starter resources
- **Pro Plan**: Pay-as-you-go

Typical usage for this app:
- Memory: ~512 MB
- CPU: Minimal
- Network: Depends on traffic

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: https://github.com/Dipendr98/thesis/issues

## Security Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] No sensitive data in code/commits
- [ ] SMTP credentials are App Password (not regular password)
- [ ] Supabase RLS policies enabled
- [ ] Test OTP email delivery
- [ ] Test user registration flow
- [ ] Test admin login
- [ ] Check Railway logs for errors
- [ ] Verify HTTPS is working
- [ ] Set up custom domain (optional)

## Quick Deploy Checklist

- [x] Dockerfile created
- [x] .dockerignore created
- [x] railway.json configured
- [ ] Push code to GitHub
- [ ] Create Railway project
- [ ] Connect GitHub repo
- [ ] Add environment variables
- [ ] Deploy Supabase schema
- [ ] Test OTP login
- [ ] Verify email delivery
- [ ] Update APP_URL
- [ ] Monitor logs

---

**Your application should now be live on Railway!** 🚀

Visit your Railway URL and test the OTP authentication flow.
