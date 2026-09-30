-- ========================================================================
-- VANI MILK CENTER, GOPUVANIPALEM
-- Supabase PostgreSQL Database Schema & Initial Seeding
-- Dashboard: https://supabase.com/dashboard/org/scgsknoptivsuphzxzoz
-- ========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER TABLE (Admin Authentication)
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORY TABLE
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCT TABLE
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT 'Fresh Farm Quality',
    "imageUrl" TEXT NOT NULL DEFAULT '/images/default-dairy.jpg',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_isActive_idx" ON "Product"("isActive");

-- 4. PRODUCT VARIANT TABLE (Pack sizes, prices, stock)
CREATE TABLE IF NOT EXISTS "ProductVariant" (
    "id" TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "packSize" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'piece',
    "price" DOUBLE PRECISION NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 100,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- 5. ORDER TABLE
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "isFunctionOrder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- 6. ORDER ITEM TABLE
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "packSize" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- 7. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS "ShopSettings" (
    "id" TEXT PRIMARY KEY DEFAULT 'default-settings',
    "shopName" TEXT NOT NULL DEFAULT 'VANI MILK CENTER, GOPIVANIPALEM',
    "phone" TEXT NOT NULL DEFAULT '7995597719',
    "whatsappNumber" TEXT NOT NULL DEFAULT '917995597719',
    "address" TEXT NOT NULL DEFAULT '659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002',
    "openingHours" TEXT NOT NULL DEFAULT 'Morning: 5:30 AM - 1:00 PM | Evening: 4:30 PM - 9:30 PM',
    "googleMapsUrl" TEXT NOT NULL DEFAULT 'https://www.google.com/maps/search/?api=1&query=659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002',
    "logoUrl" TEXT NOT NULL DEFAULT '/images/shop-logo.svg',
    "aboutDescription" TEXT NOT NULL DEFAULT 'Welcome to Vani Milk Center, Gopuvanipalem (659J+CX2). We provide 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
    "bannerText" TEXT NOT NULL DEFAULT '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- INITIAL SEED DATA
-- ========================================================================

-- Insert default admin user: siddreddylakshmankumar@gmail.com / VANI@MILK (bcrypt hash)
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "createdAt")
VALUES (
    'admin-root-01',
    'Lakshman Kumar Siddireddy',
    'siddreddylakshmankumar@gmail.com',
    '$2a$10$wK1c28c89GfOq7VjU1Tj3u7D1QW7ZpI8w0b7k4X2f5m6n9p8q1r2s',
    'ADMIN',
    NOW()
)
ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "passwordHash" = EXCLUDED."passwordHash";

-- Insert shop settings
INSERT INTO "ShopSettings" (
    "id", "shopName", "phone", "whatsappNumber", "address",
    "openingHours", "googleMapsUrl", "logoUrl", "aboutDescription", "bannerText", "updatedAt"
)
VALUES (
    'default-settings',
    'VANI MILK CENTER, GOPIVANIPALEM',
    '7995597719',
    '917995597719',
    '659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002',
    'Morning: 5:30 AM - 1:00 PM | Evening: 4:30 PM - 9:30 PM',
    'https://www.google.com/maps/search/?api=1&query=659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002',
    '/images/shop-logo.svg',
    'Welcome to Vani Milk Center, Gopuvanipalem. We deliver 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
    '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
    NOW()
)
ON CONFLICT ("id") DO UPDATE SET
    "shopName" = EXCLUDED."shopName",
    "phone" = EXCLUDED."phone",
    "whatsappNumber" = EXCLUDED."whatsappNumber",
    "address" = EXCLUDED."address",
    "openingHours" = EXCLUDED."openingHours",
    "updatedAt" = NOW();

-- Insert Categories
INSERT INTO "Category" ("id", "name", "slug", "displayOrder", "createdAt")
VALUES
    ('cat-milk', 'Milk', 'milk', 1, NOW()),
    ('cat-curd', 'Curd', 'curd', 2, NOW()),
    ('cat-buttermilk', 'Buttermilk', 'buttermilk', 3, NOW()),
    ('cat-lassi', 'Lassi', 'lassi', 4, NOW()),
    ('cat-other', 'Ghee & Extras', 'other', 5, NOW())
ON CONFLICT ("id") DO NOTHING;

-- Insert Products
INSERT INTO "Product" ("id", "name", "categoryId", "description", "quality", "imageUrl", "isActive", "isFeatured", "createdAt", "updatedAt")
VALUES
    ('prod-milk', 'Fresh Farm Milk', 'cat-milk', '100% pure, wholesome cow and buffalo milk collected fresh twice daily.', 'Fresh Farm Quality Milk', '/images/products/fresh-milk.jpg', true, true, NOW(), NOW()),
    ('prod-curd', 'Traditional Thick Curd (Dahi)', 'cat-curd', 'Rich, thick, naturally cultured curd prepared freshly every day. Ideal for daily lunch and bulk marriage functions.', 'Thick, Naturally Set Curd', '/images/products/fresh-curd.jpg', true, true, NOW(), NOW()),
    ('prod-buttermilk', 'Spiced Fresh Buttermilk (Chaas)', 'cat-buttermilk', 'Traditional churned buttermilk infused with roasted cumin, ginger, and green chillies.', 'Naturally Churned Fresh Buttermilk', '/images/products/buttermilk.jpg', true, true, NOW(), NOW()),
    ('prod-lassi', 'Sweet Creamy Lassi', 'cat-lassi', 'Thick, sweet, creamy Punjabi style lassi topped with malai and cardamom aroma.', 'Rich Malai Lassi', '/images/products/lassi.jpg', true, true, NOW(), NOW()),
    ('prod-paneer', 'Fresh Homemade Malai Paneer', 'cat-other', 'Tender, ultra-soft paneer crafted daily from whole buffalo milk.', '100% Pure Malai Paneer', '/images/products/fresh-paneer.jpg', true, false, NOW(), NOW()),
    ('prod-ghee', 'Pure Desi Cow Ghee', 'cat-other', 'Golden granular desi ghee prepared using traditional bilona method.', 'Pure Traditional Desi Ghee', '/images/products/desi-ghee.jpg', true, false, NOW(), NOW()),
    ('prod-chapatis', 'Ajay Chapatis', 'cat-other', 'Ready to eat delicious home-made soft & tasty chapatis. 100% vegetarian.', '100% Veg, Home Made', '/images/products/ajay-chapatis.jpg', true, true, NOW(), NOW()),
    ('prod-sweet-bun', 'Nandas Premium Fruit Sweet Bun', 'cat-other', 'Fresh and soft bakery sweet buns loaded with tutti-frutti pieces.', 'Fresh Bakery Quality', '/images/products/fruit-sweet-bun.jpg', true, true, NOW(), NOW()),
    ('prod-curd-bucket', 'Curd Buckets (Functions & Marriages)', 'cat-curd', 'Rich, thick, authentic curd packed in sturdy food-grade buckets for weddings and ceremonies.', 'Function Grade Thick Curd', '/images/products/curd-bucket.jpg', true, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Insert Product Variants
INSERT INTO "ProductVariant" ("id", "productId", "packSize", "unit", "price", "stockQuantity", "isAvailable", "createdAt", "updatedAt")
VALUES
    ('var-milk-250', 'prod-milk', '250 ml', 'packet', 16, 100, true, NOW(), NOW()),
    ('var-milk-500', 'prod-milk', '500 ml', 'packet', 32, 150, true, NOW(), NOW()),
    ('var-milk-1l', 'prod-milk', '1 Litre', 'packet', 62, 120, true, NOW(), NOW()),
    ('var-curd-250', 'prod-curd', '250 ml', 'cup', 25, 80, true, NOW(), NOW()),
    ('var-curd-500', 'prod-curd', '500 ml', 'packet', 48, 100, true, NOW(), NOW()),
    ('var-curd-1l', 'prod-curd', '1 Litre', 'packet', 95, 60, true, NOW(), NOW()),
    ('var-curd-5kg', 'prod-curd', '5 kg bucket', 'bucket', 350, 30, true, NOW(), NOW()),
    ('var-curd-10kg', 'prod-curd', '10 kg bucket', 'bucket', 500, 25, true, NOW(), NOW()),
    ('var-curd-20kg', 'prod-curd', '20 kg bucket', 'bucket', 980, 15, true, NOW(), NOW()),
    ('var-bm-250', 'prod-buttermilk', '250 ml', 'pouch', 15, 80, true, NOW(), NOW()),
    ('var-bm-500', 'prod-buttermilk', '500 ml', 'bottle', 25, 60, true, NOW(), NOW()),
    ('var-bm-1l', 'prod-buttermilk', '1 Litre', 'bottle', 45, 40, true, NOW(), NOW()),
    ('var-lassi-250', 'prod-lassi', '250 ml', 'glass', 25, 60, true, NOW(), NOW()),
    ('var-lassi-500', 'prod-lassi', '500 ml', 'bottle', 45, 50, true, NOW(), NOW()),
    ('var-lassi-1l', 'prod-lassi', '1 Litre', 'bottle', 85, 30, true, NOW(), NOW()),
    ('var-paneer-200', 'prod-paneer', '200 g', 'pack', 85, 40, true, NOW(), NOW()),
    ('var-paneer-500', 'prod-paneer', '500 g', 'pack', 200, 30, true, NOW(), NOW()),
    ('var-paneer-1kg', 'prod-paneer', '1 kg', 'block', 390, 20, true, NOW(), NOW()),
    ('var-ghee-250', 'prod-ghee', '250 ml', 'jar', 220, 30, true, NOW(), NOW()),
    ('var-ghee-500', 'prod-ghee', '500 ml', 'jar', 420, 25, true, NOW(), NOW()),
    ('var-ghee-1l', 'prod-ghee', '1 Litre', 'tin', 820, 20, true, NOW(), NOW()),
    ('var-chap-5', 'prod-chapatis', '5 Pieces Pack', 'packet', 40, 50, true, NOW(), NOW()),
    ('var-chap-10', 'prod-chapatis', '10 Pieces Pack', 'packet', 75, 50, true, NOW(), NOW()),
    ('var-bun-6', 'prod-sweet-bun', '6 Pieces Pack', 'box', 50, 40, true, NOW(), NOW()),
    ('var-cb-5kg', 'prod-curd-bucket', '5 kg bucket', 'bucket', 350, 30, true, NOW(), NOW()),
    ('var-cb-10kg', 'prod-curd-bucket', '10 kg bucket', 'bucket', 500, 25, true, NOW(), NOW()),
    ('var-cb-20kg', 'prod-curd-bucket', '20 kg bucket', 'bucket', 980, 15, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
