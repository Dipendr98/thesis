# ThesisTrack Admin Guide

## Accessing the Admin Panel

### Option 1: From Login Page
1. Navigate to `/login`
2. Click **"Admin Login"** link at the bottom of the page

### Option 2: Direct URL
- Go directly to `/admin/login`

### Admin Credentials
- **Email:** `admin@thesistrack.com`
- **Password:** `admin123`

> ⚠️ **Important:** Change these default credentials in production by updating `app/config.ts`

---

## Admin Panel Features

### 1. Dashboard (`/admin`)
- View **total orders** across all statuses
- Track **pending**, **processing**, and **completed** orders
- See **recent order activity** with customer details
- Monitor order status in real-time

### 2. Pricing Management (`/admin/pricing`)
- Edit pricing for all delivery plans
- Update **Base Price** and **Price per Page** independently
- See live examples of total pricing calculations
- Changes are saved to Supabase database in real-time

---

## How to Change Prices

### Step-by-Step Instructions

1. **Login** to the admin panel using credentials above
2. **Click "Pricing Plans"** in the sidebar navigation
3. **Find the plan** you want to edit (Express, Standard, or Economy)
4. **Click "Edit"** button on that plan card
5. **Enter new values:**
   - **Base Price (₹):** Fixed setup and processing cost
   - **Price per Page (₹):** Additional cost per page of content
6. **Click "Save"** to apply changes immediately
7. The pricing will update across the entire application

### Pricing Formula

```
Total Price = Base Price + (Number of Pages × Price per Page)
```

**Example:** Standard Delivery plan with 10 pages
```
₹1,500 (base) + (10 pages × ₹200/page) = ₹3,500 total
```

---

## Current Default Pricing Plans

| Plan | Delivery | Base Price | Per Page | Example (10 pages) |
|------|----------|------------|----------|--------------------|
| **Express** | 14 days | ₹2,000 | ₹300 | ₹5,000 |
| **Standard** | 7 days | ₹1,500 | ₹200 | ₹3,500 |
| **Economy** | 14 days | ₹1,000 | ₹150 | ₹2,500 |

---

## Database Integration

### Supabase Setup
This application uses **Supabase** as its backend database. All pricing and order data is stored securely in PostgreSQL.

### Tables
- **`pricing_plans`** - Stores all pricing plan configurations
- **`orders`** - Stores customer orders with status tracking

### Security
- **Row Level Security (RLS)** is enabled
- Public users can only read pricing plans and create orders
- Admin operations require authentication
- All updates are validated server-side

### Data Persistence
- All pricing changes are **immediately saved** to Supabase
- Order data is **permanently stored** (not in localStorage)
- Changes sync across all user sessions in real-time

---

## Order Management

### Order Statuses
- **Pending:** New orders awaiting review
- **Processing:** Orders currently being worked on
- **Completed:** Finished orders
- **Cancelled:** Orders that were cancelled

### Viewing Orders
1. Go to the **Dashboard** (`/admin`)
2. Scroll to **"Recent Orders"** section
3. View customer details, page count, and total price
4. Check order status with color-coded badges

---

## Tips & Best Practices

### Pricing Strategy
- **Express delivery** should be priced higher due to urgency
- **Economy delivery** offers budget-friendly options
- Base price covers overhead; per-page pricing scales with workload
- Review pricing quarterly based on market rates

### Testing Changes
- Make small adjustments and monitor customer response
- Use the example calculations to verify pricing logic
- Check that total prices remain competitive

### Security
- Never share admin credentials
- Use strong passwords in production
- Monitor order activity regularly

---

## Troubleshooting

### Can't Login?
- Verify you're using the correct credentials
- Check that you're on `/admin/login` (not `/login`)
- Clear browser cache and try again

### Prices Not Updating?
- Ensure you clicked "Save" after editing
- Refresh the page to see latest changes
- Check browser console for any errors

### Orders Not Showing?
- Database connection may be down
- Check Supabase dashboard for issues
- Verify RLS policies are correctly configured

---

## Technical Details

### File Structure
```
app/
├── routes/
│   ├── _admin.tsx              # Admin layout
│   ├── _admin._index.tsx       # Dashboard
│   ├── _admin.pricing.tsx      # Pricing management
│   └── admin.login.tsx         # Admin login
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── supabase-storage.server.ts  # Database operations
│   └── auth.ts                # Authentication helpers
└── config.ts                  # App configuration
```

### Environment Variables
- `SUPABASE_URL` / `VITE_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` - Supabase API key (anon/public)

---

## Support

For technical support or questions about the admin panel, contact your development team or refer to the application documentation.

**Version:** 2.0.0 (Supabase-powered)  
**Last Updated:** 2024
