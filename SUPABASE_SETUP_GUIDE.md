# 🥛 Vani Milk Center — Supabase PostgreSQL Database Setup & Operations Guide

**Supabase Dashboard Link:** [https://supabase.com/dashboard/project/saeeiphkhzpbujbmmiux](https://supabase.com/dashboard/project/saeeiphkhzpbujbmmiux)  
**Project Reference:** `saeeiphkhzpbujbmmiux`  
**Region:** `ap-southeast-1`  
**Host:** `aws-0-ap-southeast-1.pooler.supabase.com`  

---

## 🚀 1. How to Connect Your Supabase PostgreSQL Database

### Option A: Paste Your Database Password into `.env` (Recommended)

1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard/project/saeeiphkhzpbujbmmiux).
2. Select your project -> Click **Project Settings** (gear icon) -> **Database**.
3. Under **Connection string**, select **URI** and copy the transaction pooler / direct connection string.
4. Open the [.env](file:///c:/Users/Dell/Desktop/milk%20center/.env) or [.env.local](file:///c:/Users/Dell/Desktop/milk%20center/.env.local) file in your project.
5. Replace `[YOUR-PASSWORD]` with your actual Supabase database password:
   ```env
   # Transaction Pooler (Port 6543)
   DATABASE_URL="postgresql://postgres.saeeiphkhzpbujbmmiux:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

   # Direct Session Pooler / Direct Connection (Port 5432)
   DIRECT_URL="postgresql://postgres.saeeiphkhzpbujbmmiux:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

   NEXT_PUBLIC_SUPABASE_URL="https://saeeiphkhzpbujbmmiux.supabase.co"
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_FqHtWjyAP8JN-WNXGRAobA_QGlQBddl"
   ```
6. Push the schema and seed the initial data:
   ```powershell
   cmd.exe /c "npx prisma db push"
   cmd.exe /c "node prisma/seed.js"
   ```
   *(Or click the **"Seed / Populate Supabase"** button directly from your Admin Settings dashboard!)*

---

### Option B: 1-Click SQL Editor Execution in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/saeeiphkhzpbujbmmiux).
2. Click **SQL Editor** in the left sidebar -> Click **"New query"**.
3. Copy the entire contents of [supabase-schema.sql](file:///c:/Users/Dell/Desktop/milk%20center/supabase-schema.sql).
4. Paste it into the SQL Editor and click **Run** (Ctrl + Enter).
5. All tables (`User`, `Category`, `Product`, `ProductVariant`, `Order`, `OrderItem`, `ShopSettings`) along with initial products, pricing, and admin user will be created immediately!

---

## 📬 2. Real-Time Shop Owner Email Alerts

Whenever the admin performs changes in the store, an instant alert email is generated and sent to the owner of the shop:
- **Owner Emails:**
  - Primary: `siddreddylakshmankumar@gmail.com`
  - Secondary: `siddireddytejapavan@gmail.com`
- **Trigger Events:**
  - **Product Changes:** Adding a new product, editing prices/pack sizes/stock, or deleting a product.
  - **Shop Details Updates:** Modifying store name, phone, WhatsApp number, opening hours, address, or announcement banner.
  - **Category Updates:** Creating, renaming, or deleting product categories.
  - **Security / Credentials Alerts:** Modifying admin email, name, or password.

---

## 🛠️ 3. Admin Operations & Capabilities

Your Admin Panel now has complete control over **all operations** of the dairy center:

### 1. Product & Inventory Operations (`/admin/products`)
- **Add New Products:** Name, description, category, quality tag, and product photo upload.
- **Pack Sizes & Dynamic Pricing:** Configure any number of pack sizes (e.g. 250ml, 500ml, 1L, 5kg bucket, 10kg bucket, 20kg bucket) with custom prices in ₹ and stock quantities.
- **Stock & Availability Toggles:** Mark items in/out of stock instantly.
- **Feature on Homepage:** Highlight top products with 1 click.

### 2. Category Operations (`/admin/categories`)
- **Create New Categories:** Add dairy categories (e.g. Milk, Curd, Buttermilk, Lassi, Ghee, Sweets, Butter).
- **Custom Slugs & Order:** Choose URL slugs and control exact sorting order on the customer website.
- **Edit & Delete Categories:** Full management with protection against deleting categories containing active products.

### 3. Customer Orders & Delivery Dispatch (`/admin/orders`)
- **Walk-in & Phone Order Creator:** Take orders directly at the milk center counter or over phone calls! Choose customer name, phone, address, select products and quantities, and submit.
- **Edit Order Details:** Edit customer phone, delivery address, special function notes, or order status on the fly.
- **Live Status Tracking:** `Pending` ➔ `Confirmed` ➔ `Preparing` ➔ `Ready` ➔ `Delivered` ➔ `Cancelled`.
- **Delivery Boy Route Navigation:** 1-click turn-by-turn Google Maps navigation route from the Gopuvanipalem shop counter to customer destination.
- **WhatsApp Notification:** Directly message customer order confirmation or dispatch the rider.

### 4. Admin Account & Security (`/admin/settings`)
- Update Admin Name & Email directly in the settings dashboard.
- Change Admin Password with secure bcrypt hashing without modifying code scripts.

### 5. Shop & Business Profile (`/admin/settings`)
- Update Shop Name (`VANI MILK CENTER, GOPUVANIPALEM`).
- Phone & WhatsApp Hotline numbers (`917995597719`).
- Store Address & Opening Hours.
- Google Maps Location URL & Shop Logo.
- Announcement banner text.

### 6. Cloud Database Status & Quick Sync (`/admin/settings`)
- Real-time connection badge for Supabase PostgreSQL.
- Displays live record counts across all tables.
- **"Seed / Populate Supabase"** button for instant initial data sync.
