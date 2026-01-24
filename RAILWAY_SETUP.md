# Railway Deployment Setup Guide

## Issue: "Supabase not configured in this environment"

This error occurs because Vite embeds environment variables at **build time**, but Railway environment variables are typically only available at **runtime**.

## Solution

The Dockerfile has been updated to accept build arguments for Vite environment variables. Follow these steps to configure Railway:

### Step 1: Configure Environment Variables in Railway

1. Go to your Railway project dashboard
2. Navigate to your service settings
3. Click on the **Variables** tab
4. Add the following environment variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 2: Enable Build-Time Access

Railway automatically makes environment variables available as build arguments when using Dockerfile builds. However, to ensure proper configuration:

1. Make sure the environment variables are set in the **service** settings (not project settings)
2. The Dockerfile now includes `ARG` declarations for these variables
3. They are converted to `ENV` variables during the build stage

### Step 3: Trigger a Rebuild

After adding the environment variables:

1. Go to the **Deployments** tab
2. Click **Redeploy** on the latest deployment, OR
3. Push a new commit to trigger a rebuild

### Alternative: Using railway.toml (Optional)

If you want more explicit control, you can create a `railway.toml` file:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[build.buildArgs]
VITE_SUPABASE_URL = "${{VITE_SUPABASE_URL}}"
VITE_SUPABASE_ANON_KEY = "${{VITE_SUPABASE_ANON_KEY}}"
```

## Verification

After deployment, the warning message should disappear, and the Google login button should be enabled.

### Debug Steps

If the issue persists:

1. Check Railway build logs for the environment variable values
2. Look for lines like: `ENV VITE_SUPABASE_URL=...`
3. Verify the variables are set (values should not be empty)
4. Check the browser console for the Supabase client initialization logs

## Important Notes

- **Security**: Never commit the `.env` file to git
- **Build vs Runtime**: Remember that `VITE_*` variables are embedded at build time and cannot be changed without rebuilding
- **Multiple Environments**: If you have staging/production, set these variables in each environment separately
