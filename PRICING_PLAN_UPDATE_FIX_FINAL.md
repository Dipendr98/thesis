# Pricing Plan Update Fix - Complete Solution

## Problem Summary

Pricing plan updates were failing with the error "Failed to update pricing plan. Please try again." This happened because admin operations were using the wrong Supabase client configuration.

## Root Cause Analysis

### The Issue

1. **Admin Authentication**: The admin login system uses localStorage (not Supabase Auth)
2. **Database Operations**: Pricing plan updates used the regular Supabase client with the `anon` key
3. **Row Level Security (RLS)**: The database has RLS policies that check `auth.uid()` against the `admins` table
4. **Authentication Mismatch**: Since admins don't authenticate through Supabase Auth, `auth.uid()` returns `null`
5. **Update Blocked**: The RLS policy blocked the update because there was no valid Supabase auth session

### Why Previous Fixes Didn't Work

The previous fix (commit 432467f) added RLS UPDATE policies with `is_admin()` function:

```sql
CREATE POLICY "Admins can update pricing plans"
  ON pricing_plans FOR UPDATE
  TO authenticated
  USING (is_admin());
```

However, this policy relies on `auth.uid()` being set, which only happens when you authenticate through Supabase Auth. Since the admin login uses localStorage, there's no Supabase auth session.

## The Solution

### Overview

Create a **separate admin Supabase client** that uses the **service role key** instead of the anon key. The service role key has elevated permissions and bypasses all RLS policies.

### What Changed

#### 1. New Admin Client (`app/lib/supabase-admin.server.ts`)

Created a dedicated admin client that:
- Uses the `SUPABASE_SERVICE_ROLE_KEY` environment variable
- Bypasses all RLS policies
- Is server-only (never exposed to the browser)
- Falls back to anon key with a warning if service role key is missing

#### 2. Updated Admin Operations

Modified these functions in `app/lib/supabase-storage.server.ts` to use the admin client:
- `updatePricingPlan()` - Update pricing plan settings
- `updateQRSettings()` - Update QR code settings
- `updateOrderStatus()` - Update order status (admin action)

#### 3. Environment Configuration

Added `SUPABASE_SERVICE_ROLE_KEY` to `.env` file with instructions on how to get it.

## How to Complete the Fix

### Step 1: Get Your Service Role Key

1. Go to your Supabase project settings:
   ```
   https://app.supabase.com/project/loegrisrrrqyaixglljy/settings/api
   ```

2. Find the **"Project API keys"** section

3. Look for the key labeled **"service_role"** (NOT the anon key)

4. Click the eye icon to reveal the key

5. Copy the entire key (it starts with `eyJ...`)

### Step 2: Update Your .env File

Replace the placeholder in your `.env` file:

```env
# Before
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# After (example - use your actual key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Test the Fix

1. Log in to the admin panel at `/admin/login`
2. Navigate to **Pricing** section
3. Click **Edit** on the pricing plan
4. Change the base price or delivery days
5. Click **Save Changes**
6. Verify the update succeeds without errors

## Security Considerations

### Why This Is Safe

1. **Server-Only**: The admin client is in a `.server.ts` file, which is never sent to the browser
2. **Environment Variable**: The service role key is stored in `.env`, which is gitignored
3. **Admin Authentication**: You still need to log in as admin to access the admin routes
4. **Standard Pattern**: Using service role key for admin operations is the recommended Supabase pattern

### Important Warnings

- **Never** commit the service role key to git
- **Never** use the admin client in client-side code
- **Never** expose the service role key in browser JavaScript
- **Always** keep the `.env` file gitignored

## Technical Details

### File Changes

1. **Created**: `app/lib/supabase-admin.server.ts`
   - New admin Supabase client with service role support
   - Automatic fallback with warning if key is missing

2. **Modified**: `app/lib/supabase-storage.server.ts`
   - Import admin client
   - Update `updatePricingPlan()` to use admin client
   - Update `updateQRSettings()` to use admin client
   - Update `updateOrderStatus()` to use admin client

3. **Modified**: `.env`
   - Added `SUPABASE_SERVICE_ROLE_KEY` with instructions

### Code Changes

```typescript
// Before (used anon key, blocked by RLS)
export async function updatePricingPlan(id, updates) {
  const { data, error } = await supabase  // anon key
    .from("pricing_plans")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// After (uses service role, bypasses RLS)
export async function updatePricingPlan(id, updates) {
  const { data, error } = await supabaseAdmin  // service role key
    .from("pricing_plans")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

## What This Fixes

✅ **Pricing plan updates** - Admins can now update base price and delivery days
✅ **QR code settings** - Admins can update payment QR code
✅ **Order status updates** - Admins can change order status
✅ **Future admin operations** - Template for other admin functions

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Cause**: Service role key not added to `.env`
**Solution**: Follow Step 1 and Step 2 above to add the key

### Error: "Failed to update pricing plan" (Still Happening)

**Cause**: Server not restarted after adding key
**Solution**: Stop the server (Ctrl+C) and restart with `npm run dev`

### Error: "Invalid API key"

**Cause**: Wrong key copied or key has spaces/newlines
**Solution**:
- Make sure you copied the **service_role** key, not the anon key
- Remove any spaces or line breaks from the key
- The key should be one continuous string

### Warning: "Admin operations may fail due to RLS policies"

**Cause**: Service role key not found in environment variables
**Solution**:
1. Check `.env` file has `SUPABASE_SERVICE_ROLE_KEY`
2. Verify the key doesn't have typos
3. Restart the development server

## Deployment Notes

### Railway/Production Deployment

When deploying to Railway or other platforms:

1. Add `SUPABASE_SERVICE_ROLE_KEY` to your environment variables in the platform dashboard
2. Use the same service role key from your Supabase project
3. Never commit the key to git
4. Restart the deployment after adding the key

### Environment Variables Needed

```env
# Required for all environments
SUPABASE_URL=https://loegrisrrrqyaixglljy.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For client-side (Vite builds)
VITE_SUPABASE_URL=https://loegrisrrrqyaixglljy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## Alternative Solutions Considered

### Option 1: Migrate to Supabase Auth (Not Chosen)

**Pros**:
- Proper authentication flow
- Better security
- Native RLS support

**Cons**:
- Requires rewriting entire admin auth system
- Breaking change for existing admin users
- More complex implementation

### Option 2: Modify RLS Policies (Not Chosen)

**Pros**:
- No code changes needed

**Cons**:
- Less secure (would need to weaken RLS)
- Doesn't follow Supabase best practices
- Could create security vulnerabilities

### Option 3: Service Role Client (Chosen) ✅

**Pros**:
- Minimal code changes
- Follows Supabase best practices
- Maintains security
- Works with existing auth system
- Easy to test and deploy

**Cons**:
- Requires service role key in environment
- Need to be careful not to expose it

## Resources

- [Supabase Service Role Key Documentation](https://supabase.com/docs/guides/api/api-keys#the-servicerole-key)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Server-Only Code in React Router](https://reactrouter.com/how-to/server-only-code)

## Related Commits

- **Initial RLS Fix**: `432467f` - Added RLS UPDATE policy (incomplete solution)
- **Current Fix**: This commit - Added service role client for admin operations

---

**Status**: ✅ **Ready to deploy after adding service role key**

Last Updated: 2026-01-24
