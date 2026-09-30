# 🥛 Vani Milk Center — PostgreSQL Database Setup & Operations Guide

This guide explains how to connect and run your **PostgreSQL** database with the Vani Milk Center store.

---

## 🚀 1. How to Connect Your PostgreSQL Database

The project is natively powered by **Prisma ORM** with **PostgreSQL**.

### Step 1: Configure Your PostgreSQL Connection String
Open your **[.env](file:///c:/Users/Dell/Desktop/milk%20center/.env)** or **[.env.local](file:///c:/Users/Dell/Desktop/milk%20center/.env.local)** file and configure `DATABASE_URL`:

- **For Local PostgreSQL:**
  ```env
  DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vani_milk_center?schema=public"
  ```

- **For Remote / Cloud PostgreSQL (e.g. Neon, Aiven, Render, Railway):**
  ```env
  DATABASE_URL="postgresql://username:password@your-postgres-host.com:5432/vani_milk_center?sslmode=require"
  ```

### Step 2: Initialize Database Schema & Seed Data
Once your PostgreSQL database is running, execute:
```powershell
cmd.exe /c "npx prisma db push"
cmd.exe /c "node prisma/seed.js"
```
*(Or click the **"Seed / Populate PostgreSQL"** button directly from your Admin Settings dashboard!)*

### Step 3: Test Connection
Run the connection test script anytime to verify health:
```powershell
cmd.exe /c "node scripts/test-db-connection.js"
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
