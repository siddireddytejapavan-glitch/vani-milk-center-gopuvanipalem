# 🥛 Vani Milk Center — PostgreSQL Database Setup & Operations Guide

This guide explains how to connect and run your **PostgreSQL** database with the Vani Milk Center store.

---

## ⚡ 1. Quick Free Cloud PostgreSQL Setup (Neon.tech - 2 Minutes)

[Neon.tech](https://neon.tech) is a free serverless PostgreSQL database that requires **zero credit card**, provides instant direct PostgreSQL URLs, and works seamlessly with Prisma.

### Step 1: Create Your Free Database on Neon
1. Go to **[https://neon.tech](https://neon.tech)** and click **Sign Up** (Sign in with your GitHub or Google account).
2. Click **"Create Project"**.
   - Project Name: `vani-milk-center`
   - Database Name: `vani_milk_center` (or default `neondb`)
   - Region: Select nearest (e.g. `ap-southeast-1` Singapore or `ap-south-1` Mumbai)
3. Click **"Create Project"**.

### Step 2: Copy Connection String
On your Neon dashboard, under **Connection Details**:
1. Select **Prisma** or **Postgres** format.
2. Copy the connection string. It will look like:
   ```text
   postgresql://neondb_owner:npg_xxxxxxx@ep-xyz-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3: Paste in `.env` and `.env.local`
Open your local **[.env](file:///c:/Users/Dell/Desktop/milk%20center/.env)** and **[.env.local](file:///c:/Users/Dell/Desktop/milk%20center/.env.local)** and set `DATABASE_URL`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_xxxxxxx@ep-xyz-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

### Step 4: Push Tables & Seed Dairy Products
Run these two commands in PowerShell:
```powershell
cmd.exe /c "npx prisma db push"
cmd.exe /c "node prisma/seed.js"
```
*(Or click the green **"Seed / Populate PostgreSQL"** button in your Admin Settings dashboard!)*

### Step 5: Verify Connection
Run the connection diagnosis script:
```powershell
cmd.exe /c "node scripts/test-db-connection.js"
```
You will see:
```text
✅ SUCCESS: Successfully connected to PostgreSQL database!
📊 Table Record Counts:
   - Users (Admin): 1
   - Categories: 5
   - Products: 9
   - Orders: 0
```

---

## 📬 2. Real-Time Shop Owner Email Alerts

Whenever the admin modifies products or store details, automatic alerts are dispatched to the shop owner:
- **Owner Emails:**
  - Primary: `siddreddylakshmankumar@gmail.com`
  - Secondary: `siddireddytejapavan@gmail.com`
- **Active Triggers:**
  - **Product Changes:** Additions, pack size modifications, price changes, stock updates, deletions.
  - **Shop Details & Profile:** Name, phone, WhatsApp hotline (`917995597719`), address, opening hours, banner text.
  - **Category Updates:** Category additions, reordering, deletions.
  - **Security / Credentials Alerts:** Admin name, email, or password changes.

---

## 🛠️ 3. Admin Operations & Capabilities

- **Products & Pack Sizes (`/admin/products`):** Full control over milk, curd, buttermilk, lassi, ghee, chapatis, sweet buns, and curd wedding buckets.
- **Categories (`/admin/categories`):** Add, reorder, and manage product categories.
- **Orders & Delivery Dispatch (`/admin/orders`):** Create walk-in/telephone orders, edit customer addresses, live order status updates, and 1-click Google Maps delivery route navigation.
- **Admin Account & Security (`/admin/settings`):** Change admin credentials and passwords securely.
- **Shop & Business Profile (`/admin/settings`):** Update contact numbers, opening hours, banner announcements, and logo.
- **PostgreSQL Database Status (`/admin/settings`):** Live database status indicator, record counts, and 1-click database seeder.
