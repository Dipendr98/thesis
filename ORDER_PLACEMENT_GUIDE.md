# Order Placement Guide

## ✅ How to Place an Order - Complete Flow

Your order placement system is now fully functional! Here's how users can place orders and how you can track them.

---

## **For Customers - Placing an Order**

### **Step 1: Start Your Order**

There are three ways to start:

1. **Home Page** - Click "Place Order" button
2. **Pricing Page** - Click "Select Plan" on any pricing card
3. **Direct Link** - Navigate to `/order`

### **Step 2: Fill Out Order Form**

The order form requires:

**Required Fields:**
- **Full Name** - Customer's full name
- **Email Address** - Valid email (e.g., user@example.com)
- **Phone Number** - 10-digit mobile number
- **Select Plan** - Choose Express, Standard, or Economy
- **Number of Pages** - Between 1-500 pages
- **Requirements** - Detailed description of research topic, citation style, and specific instructions

**Automatic Price Calculation:**
- As you select a plan and enter pages, the price automatically updates
- Shows breakdown: Base Price + (Per Page Price × Pages) = Total

### **Step 3: Submit Order**

- Click "Place Order" button
- Order is saved to Supabase database
- Status automatically set to "pending"
- You're redirected to your dashboard

---

## **For Customers - After Placing Order**

### **Dashboard Access**

**Option 1: Already Logged In**
- Automatically redirected to `/dashboard` after order placement

**Option 2: Not Logged In**
- Go to `/login`
- Enter the same phone number used in the order
- Verify OTP (shown in browser console)
- View all your orders in the dashboard

### **What You'll See**

**Order Cards Display:**
- Plan name (Express/Standard/Economy)
- Order date
- Status badge (pending/processing/completed/cancelled)
- Number of pages
- Total price (₹)

**Dashboard Sections:**
1. **Your Profile** - Mobile number, User ID, member since date
2. **Your Orders** - All orders placed with that phone number
3. **Quick Actions** - View pricing, contact support

---

## **For Admin - Managing Orders**

### **Admin Login**
- URL: `/admin/login`
- Email: `admin@thesistrack.com`
- Password: `admin123`

### **View All Orders** (`/admin/orders`)

**Complete Order List:**
- Every order ever placed
- Customer name, email, phone
- Plan name, pages, total price
- Order date and status
- **Update order status** via dropdown + button

**Status Options:**
- Pending → Initial state when order is created
- Processing → Work has started
- Completed → Order finished and delivered
- Cancelled → Order cancelled

### **View All Customers** (`/admin/users`)

**Derived from Orders:**
- Unique customers extracted from order data
- Shows:
  - Customer name and contact info
  - Total orders placed
  - Total amount spent (₹)
  - Order breakdown by status (badges)
  - Last order date

### **Dashboard Stats** (`/admin`)
- Total order count
- Pending/processing/completed counts
- Recent order activity

---

## **Data Flow Architecture**

### **Order Creation Process**

1. **User fills form** on `/order` page
2. **Form validation** checks all required fields
3. **Price calculation** uses selected plan + pages
4. **Server action** receives form data
5. **Supabase insert** creates new order record
6. **Redirect to dashboard** with order ID
7. **Dashboard loader** fetches orders by phone number

### **Database Schema**

**Orders Table:**
```
- id (UUID, primary key)
- customer_name (text)
- customer_email (text)
- customer_phone (text)
- plan_id (UUID, foreign key to pricing_plans)
- plan_name (text)
- pages (integer)
- requirements (text)
- total_price (integer)
- status (enum: pending|processing|completed|cancelled)
- created_at (timestamp)
- updated_at (timestamp)
```

### **Data Storage Locations**

| Data Type | Storage |
|-----------|---------|
| Orders | Supabase `orders` table |
| Pricing Plans | Supabase `pricing_plans` table |
| Customer Data | Derived from orders (no separate table) |
| User Sessions | localStorage (phone + OTP verification) |
| Admin Sessions | localStorage (email + password) |

---

## **Key Features**

### **Real-Time Price Calculator**
- Updates as user changes plan or pages
- Shows itemized breakdown
- Displays total in Indian Rupees (₹)

### **Smart Plan Selection**
- Can pre-select plan via URL: `/order?plan=PLAN_ID`
- Plans show: Name - ₹Base + ₹PerPage/page (X days)
- All active plans from database

### **Form Validation**
- Name required
- Valid email format
- 10-digit phone number only
- Pages between 1-500
- All fields mandatory before submission

### **Error Handling**
- Invalid email → "Invalid email address"
- Invalid phone → "Phone number must be 10 digits"
- Missing fields → "All fields are required"
- Invalid plan → "Invalid plan selected"
- Database error → "Failed to create order. Please try again."

### **Order Tracking**
- Users see ALL orders placed with their phone number
- Orders sorted by most recent first
- Color-coded status badges
- Mobile-responsive cards

---

## **Testing the Flow**

### **Test Order Creation**

1. Go to `/order` (or click "Place Order" on home page)
2. Fill in test data:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Plan: Any plan
   - Pages: 10
   - Requirements: "Test order for computer science thesis on AI"
3. Submit and verify redirect to dashboard
4. Check dashboard shows the new order

### **Test Admin View**

1. Login to admin at `/admin/login`
2. Go to "All Orders" (`/admin/orders`)
3. Verify new test order appears
4. Try updating status: Pending → Processing
5. Check "Customers" tab shows test user with order count

### **Test User Dashboard**

1. Go to `/login`
2. Enter phone: 9876543210
3. Check console for OTP
4. Verify login and see orders

---

## **URL Reference**

### **Public Pages**
- `/` - Home page
- `/pricing` - View pricing plans
- `/about` - About page
- `/contact` - Contact page
- `/order` - **Place new order** ⭐
- `/login` - User login (OTP)
- `/dashboard` - User dashboard (view orders)

### **Admin Pages**
- `/admin/login` - Admin login
- `/admin` - Admin dashboard
- `/admin/orders` - All orders management ⭐
- `/admin/users` - All customers
- `/admin/pricing` - Pricing management

---

## **What Was Created/Updated**

### **New Files**
✅ `app/routes/order.tsx` - Order placement page with form
✅ `app/routes/order.module.css` - Order page styling
✅ `ORDER_PLACEMENT_GUIDE.md` - This comprehensive guide

### **Updated Files**
✅ `app/routes.ts` - Added `/order` route
✅ `app/routes/_public.pricing.tsx` - Links to `/order?plan=ID`
✅ `app/routes/_public._index.tsx` - "Place Order" goes to `/order`
✅ `app/routes/dashboard.tsx` - Shows user's orders, added loader
✅ `app/routes/dashboard.module.css` - Added order card styles
✅ `app/lib/supabase.ts` - Updated Order type (added plan_name, requirements)
✅ `app/lib/supabase-storage.server.ts` - Added `getOrdersByPhone()` function

---

## **Common Questions**

**Q: Why do users need to login after placing an order?**
A: The order form doesn't require login, but to VIEW orders in the dashboard, users must verify their phone number via OTP. This ensures only they can see their orders.

**Q: Can users place orders without logging in?**
A: Yes! The `/order` page is public. Users only need to login to view their order history in the dashboard.

**Q: How are customers tracked if there's no customers table?**
A: Customers are derived from the orders table. Each unique phone number = one customer. Their stats (total orders, total spent) are calculated on-the-fly from their orders.

**Q: Can admin see customer phone numbers?**
A: Yes, admins see full customer details (name, email, phone) in both the Orders and Customers sections.

**Q: What happens if a user enters a different phone number?**
A: Each phone number creates a separate user account. Orders are tied to the phone number used when placing the order, not the account used to view them.

---

## **Next Steps (Optional Enhancements)**

- Add payment integration (Razorpay/Stripe)
- Email notifications on order status changes
- File upload for order requirements
- Order editing before processing
- Refund/cancellation workflow
- Customer order history export
- Admin order search and filters
- Delivery tracking
- Customer testimonials after completion

---

**Status:**
✅ Order placement flow complete
✅ User dashboard shows orders
✅ Admin can manage all orders
✅ Real-time price calculation
✅ Full form validation
✅ Mobile responsive
✅ Type-safe with TypeScript
✅ No build errors
