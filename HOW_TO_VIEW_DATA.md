# How to View Orders, Customers & Everything

## Quick Access Guide

### Admin Login
1. **URL:** `/admin/login`
2. **Credentials:**
   - Email: `admin@thesistrack.com`
   - Password: `admin123`

**Alternative Login:** Go to `/login` → Click "Admin Login" at the bottom

---

## Admin Panel Overview

Once logged in, you have access to **4 main sections** via the left sidebar:

### 📊 1. Dashboard (`/admin`)

**What You See:**
- **Statistics Cards:**
  - Total Orders count
  - Pending orders count
  - Processing orders count
  - Completed orders count

- **Recent Orders List:**
  - Customer name and email
  - Number of pages
  - Total price
  - Order status with color-coded badges
  - Order creation date and time

**Use Case:** Quick overview of business health and recent activity

---

### 🛒 2. All Orders (`/admin/orders`)

**What You See:**
- **Complete order cards** with full details for every order
- Each card shows:
  - Order ID (first 8 characters)
  - Current status badge
  - Customer details (name, email, phone)
  - Order specifics (pages, total price)
  - Order creation date

**What You Can Do:**
- **Update Order Status** directly from each card:
  - Pending → Processing → Completed
  - Or mark as Cancelled

**How to Update Status:**
1. Click the dropdown under "Update Status"
2. Select new status (Pending/Processing/Completed/Cancelled)
3. Click "Update" button
4. Page refreshes with updated status

**Use Case:** Detailed order management and status tracking

---

### 👥 3. Customers (`/admin/users`)

**What You See:**
- **Total customer count** at the top
- **Customer cards** showing:
  - Full name
  - Email address
  - Phone number (if provided)
  - Last order date
  - Total number of orders
  - Total amount spent (₹)
  - Order breakdown by status (badges)

**Order Status Breakdown:**
- Yellow badge: Pending orders count
- Blue badge: Processing orders count
- Green badge: Completed orders count
- Red badge: Cancelled orders count

**Use Case:** Customer relationship management, identify VIP customers, track customer lifetime value

---

### 💰 4. Pricing Plans (`/admin/pricing`)

**What You See:**
- Three pricing tiers:
  - **Express Delivery** (3 days)
  - **Standard Delivery** (7 days)
  - **Economy Delivery** (14 days)

- Each plan shows:
  - Delivery timeframe
  - Base price (₹)
  - Price per page (₹)

**What You Can Do:**
- **Edit any pricing plan:**
  1. Click "Edit" button on a plan
  2. Enter new base price
  3. Enter new price per page
  4. Click "Save"
  5. Changes apply instantly across the entire site

**Use Case:** Dynamic pricing strategy, seasonal adjustments, market competition

---

## Data Sources

### Where Data is Stored:

**Supabase Database (Production Data):**
- ✅ Orders
- ✅ Pricing plans
- ✅ Customer information (extracted from orders)

**localStorage (Admin Only):**
- ✅ Admin login credentials
- ⚠️ Used for admin authentication only

### Database Tables:

**`pricing_plans` table:**
```
- id (uuid)
- name (text)
- delivery_days (integer)
- base_price (numeric)
- price_per_page (numeric)
- created_at (timestamp)
- updated_at (timestamp)
```

**`orders` table:**
```
- id (uuid)
- customer_name (text)
- customer_email (text)
- customer_phone (text)
- pricing_plan_id (uuid)
- pages (integer)
- total_price (numeric)
- status (text: pending/processing/completed/cancelled)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## How to Check Everything is Working

### 1. Check if Orders Exist
- Go to **Dashboard** → Look at "Total Orders" number
- If it shows `0`, no orders have been placed yet

### 2. Check if Customers Exist
- Go to **Customers** → Look at top-right counter
- If it shows `0`, no orders have been placed yet
- Customers are automatically created when orders are placed

### 3. Check Pricing Plans
- Go to **Pricing Plans**
- You should see 3 plans (Express, Standard, Economy)
- These are created automatically from the migration

### 4. Verify Database Connection
Open browser console and run:
```javascript
fetch('/admin/orders')
  .then(r => r.ok ? console.log('✅ Connected') : console.log('❌ Error'))
```

---

## Creating Test Data

### To Test the System with Sample Orders:

**Option 1: Use SQL Migration**
Create a new migration with sample orders:
```sql
INSERT INTO orders (customer_name, customer_email, customer_phone, pricing_plan_id, pages, total_price, status)
VALUES 
  ('John Doe', 'john@example.com', '+91-9876543210', 
   (SELECT id FROM pricing_plans WHERE name = 'Express Delivery'), 
   50, 17000, 'pending'),
  ('Jane Smith', 'jane@example.com', '+91-9876543211', 
   (SELECT id FROM pricing_plans WHERE name = 'Standard Delivery'), 
   30, 7500, 'processing');
```

**Option 2: Use Public Pricing Page**
1. Go to `/pricing` (public page)
2. Select a plan
3. Fill in customer details
4. Submit order
5. Check admin panel for new order

---

## Troubleshooting

### No Orders Showing?
1. Check Supabase dashboard → Table Editor → `orders` table
2. Verify database connection is working
3. Check browser console for errors
4. Try clearing cache and refreshing

### No Customers Showing?
- Customers page shows data **extracted from orders**
- If no orders exist, no customers will appear
- Create an order first to see customer data

### Can't Update Order Status?
1. Check if you're logged in as admin
2. Verify Supabase connection
3. Check browser console for errors
4. Ensure status value is valid (pending/processing/completed/cancelled)

### Pricing Changes Not Reflecting?
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Check Supabase dashboard → `pricing_plans` table
3. Verify the update was saved

---

## Summary

| Section | URL | Purpose |
|---------|-----|---------|
| Dashboard | `/admin` | Quick stats & recent activity |
| All Orders | `/admin/orders` | Detailed order management |
| Customers | `/admin/users` | Customer insights & history |
| Pricing | `/admin/pricing` | Update pricing dynamically |

**Everything is real-time.** All changes save to Supabase and are instantly reflected across the application.

**All data persists.** Unlike localStorage, Supabase data survives browser clearing and is accessible from any device.
