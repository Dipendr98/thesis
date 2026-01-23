# Supabase Integration Setup Guide

This guide will help you set up and configure Supabase for the ThesisTrack application.

## Overview

The application has been configured to use Supabase as the backend database, replacing the previous localStorage-based storage system. This provides:

- **Persistent data storage** across devices and sessions
- **Real-time capabilities** for live updates
- **Secure authentication** with Row Level Security (RLS)
- **Scalable infrastructure** that grows with your application
- **Built-in database backups** and reliability

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- Basic understanding of SQL

## Step 1: Environment Configuration

The Supabase credentials have already been configured in your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://loegrisrrrqyaixglljy.supabase.co
SUPABASE_ANON_KEY=sb_publishable_30mbXibFDKN2rXZXQlkDGQ_j_M5ZWOZ

# For client-side access (Vite)
VITE_SUPABASE_URL=https://loegrisrrrqyaixglljy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_30mbXibFDKN2rXZXQlkDGQ_j_M5ZWOZ
```

### Important Security Notes

- The `.env` file is already gitignored to prevent accidentally committing your credentials
- Never share your Supabase credentials publicly
- For production, use environment-specific API keys
- Consider using Supabase's service role key for server-side operations that require elevated permissions

## Step 2: Database Setup

### Create Database Tables

1. Go to your Supabase dashboard: https://app.supabase.com/project/loegrisrrrqyaixglljy
2. Navigate to the **SQL Editor** in the left sidebar
3. Create a new query
4. Copy the entire contents of `supabase-schema.sql` from the project root
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

This will create:
- `users` - User accounts
- `admins` - Admin accounts
- `orders` - Thesis orders
- `pricing_plans` - Pricing configurations
- `plans` - Legacy plan configurations
- `qr_settings` - QR code settings for payments
- All necessary indexes and triggers
- Row Level Security policies

### Database Tables Overview

#### Users Table
Stores user account information:
- `id` (UUID, primary key)
- `email` (unique)
- `mobile` (optional)
- `name` (optional)
- `created_at`, `updated_at`

#### Orders Table
Stores thesis orders with all details:
- `id` (UUID, primary key)
- `user_id` (foreign key to users)
- `topic`, `domain`, `type`
- `pages`, `citation_style`, `deadline`
- `status` (Pending Payment, Verified, In Progress, etc.)
- `payment_screenshot`, `deliverables`
- `total_price`
- And more...

#### Pricing Plans Table
Configurable pricing based on delivery time:
- `id` (text, primary key)
- `name`, `delivery_days`
- `base_price`, `price_per_page`

## Step 3: Admin Account Setup

The default admin account needs its password hashed with bcrypt:

1. Generate a bcrypt hash for your admin password:
   ```bash
   npm install -g bcrypt-cli
   bcrypt-hash "your-password-here"
   ```

2. Update the admin password hash in Supabase:
   ```sql
   UPDATE admins
   SET password_hash = '$2a$10$YOUR_HASHED_PASSWORD_HERE'
   WHERE email = 'admin@thesistrack.com';
   ```

## Step 4: Using the Supabase Client

### Server-Side Usage

The application uses `supabase-storage.server.ts` for all database operations:

```typescript
import {
  getUsers,
  getUserByEmail,
  createUser,
  getOrders,
  createOrder,
  // ... more functions
} from "~/lib/supabase-storage.server";

// Example: Get all users
const users = await getUsers();

// Example: Create a new user
const newUser = await createUser({
  email: "user@example.com",
  name: "John Doe",
});

// Example: Get orders for a specific user
const userOrders = await getOrdersByUserId(userId);
```

### Client-Side Usage

The Supabase client is available for client-side operations:

```typescript
import { supabase } from "~/lib/supabase";

// Example: Subscribe to real-time changes
supabase
  .channel('orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    console.log('Order changed!', payload);
  })
  .subscribe();
```

## Step 5: Migrating from LocalStorage

The application currently uses `storage.ts` (localStorage). To migrate to Supabase:

### Migration Strategy

1. **Dual Mode** (Recommended for testing):
   - Keep both storage systems running temporarily
   - Write to both localStorage and Supabase
   - Read from Supabase with localStorage fallback

2. **Full Migration**:
   - Export data from localStorage
   - Import data into Supabase using the SQL editor
   - Update all imports from `~/lib/storage` to `~/lib/supabase-storage.server`

### Update Imports

Find and replace in your route files:

```typescript
// OLD (localStorage)
import { storage } from "~/lib/storage";
const users = storage.getUsers();

// NEW (Supabase)
import { getUsers } from "~/lib/supabase-storage.server";
const users = await getUsers();
```

**Important**: Supabase operations are **async** and return Promises. Make sure to:
- Add `async` to your loader/action functions
- Use `await` when calling Supabase functions
- Handle errors with try-catch blocks

## Step 6: Row Level Security (RLS)

The database schema includes RLS policies for security:

### Current Policies

- **Users**: Can only view and update their own profile
- **Orders**: Users can only view and create their own orders
- **Pricing Plans**: Public read access
- **Plans**: Public read access
- **QR Settings**: Public read access

### Admin Operations

For admin operations that need to bypass RLS:
1. Use the service role key (not included in .env for security)
2. Or create a separate admin client with elevated permissions
3. Or use Supabase Functions with service role access

## Step 7: Testing the Integration

### Test Database Connection

Create a test route to verify the connection:

```typescript
// app/routes/test-db.tsx
import { json } from "react-router";
import { getUsers, getPricingPlans } from "~/lib/supabase-storage.server";

export async function loader() {
  try {
    const users = await getUsers();
    const plans = await getPricingPlans();

    return json({
      success: true,
      usersCount: users.length,
      plansCount: plans.length
    });
  } catch (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
```

Visit http://localhost:5173/test-db to verify the connection.

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure `.env` file exists in project root
   - Restart the dev server after adding environment variables

2. **"Failed to fetch"**
   - Check that the Supabase project URL is correct
   - Verify your internet connection
   - Check Supabase dashboard for project status

3. **"Permission denied"**
   - Review RLS policies in Supabase dashboard
   - Ensure you're authenticated for protected operations
   - Use service role key for admin operations

4. **TypeScript errors**
   - Run `npm run typecheck` to identify issues
   - Ensure all database functions are properly typed
   - Update imports to use async/await

## Step 8: Next Steps

### Recommended Enhancements

1. **Implement Supabase Auth**
   - Replace custom OTP system with Supabase Auth
   - Use built-in email authentication
   - Add social login options (Google, GitHub, etc.)

2. **Add Storage for Files**
   - Use Supabase Storage for file uploads
   - Store payment screenshots and deliverables
   - Generate secure, time-limited download URLs

3. **Enable Real-time Features**
   - Live order status updates
   - Admin dashboard real-time notifications
   - User notification system

4. **Set Up Database Backups**
   - Configure automatic backups in Supabase dashboard
   - Set up point-in-time recovery
   - Test restoration procedures

5. **Performance Optimization**
   - Add database indexes for frequently queried fields
   - Use Supabase Edge Functions for complex operations
   - Implement caching strategies

## Available Functions

### User Management
- `getUsers()` - Get all users
- `getUserByEmail(email)` - Find user by email
- `getUserById(id)` - Find user by ID
- `createUser(user)` - Create new user
- `updateUser(id, updates)` - Update user

### Admin Management
- `getAdmin(email?)` - Get admin by email
- `createAdmin(admin)` - Create new admin

### Order Management
- `getOrders()` - Get all orders
- `getOrder(id)` - Get single order
- `getOrdersByUserId(userId)` - Get orders for user
- `createOrder(order)` - Create new order
- `updateOrder(id, updates)` - Update order
- `updateOrderStatus(id, status)` - Update order status

### Pricing Management
- `getPricingPlans()` - Get all pricing plans
- `getPricingPlan(id)` - Get single plan
- `updatePricingPlan(id, updates)` - Update plan

### Plans Management
- `getPlans()` - Get all plans
- `getPlanById(id)` - Get single plan
- `savePlans(plans)` - Save/update plans

### QR Settings
- `getQRSettings()` - Get QR settings
- `updateQRSettings(url)` - Update QR code URL

## Support and Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Dashboard**: https://app.supabase.com/project/loegrisrrrqyaixglljy
- **React Router Documentation**: https://reactrouter.com/
- **Project Issues**: Check the project README for support contacts

## Troubleshooting

### Database Connection Issues

If you encounter connection issues:

1. Verify your Supabase project is active
2. Check the API keys are correct
3. Ensure your IP is not blocked (check Supabase dashboard)
4. Review Supabase service status

### Migration Issues

If data isn't appearing after migration:

1. Check RLS policies aren't blocking access
2. Verify data was properly inserted (use SQL Editor)
3. Check for TypeScript/type mapping issues
4. Review browser console and server logs

### Authentication Issues

If authentication isn't working:

1. The current system uses custom OTP authentication
2. Consider migrating to Supabase Auth for better security
3. Review session management in your routes
4. Check cookie and session configuration

---

**Congratulations!** Your ThesisTrack application is now integrated with Supabase. You have a scalable, secure, and reliable database backend that will grow with your application.

For questions or issues, please refer to the Supabase documentation or create an issue in the project repository.
