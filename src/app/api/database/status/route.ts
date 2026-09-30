import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, isDatabaseConfigured, getDatabaseInfo } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_SHOP_SETTINGS,
} from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbInfo = getDatabaseInfo();

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ...dbInfo,
      status: 'pending_connection',
      message: 'PostgreSQL connection string needs to be configured in .env',
      counts: {
        users: 1,
        categories: DEFAULT_CATEGORIES.length,
        products: DEFAULT_PRODUCTS.length,
        variants: DEFAULT_PRODUCTS.flatMap((p) => p.variants).length,
        orders: 0,
      },
    });
  }

  try {
    const [userCount, categoryCount, productCount, variantCount, orderCount, settings] =
      await Promise.all([
        prisma.user.count(),
        prisma.category.count(),
        prisma.product.count(),
        prisma.productVariant.count(),
        prisma.order.count(),
        prisma.shopSettings.findUnique({ where: { id: 'default-settings' } }),
      ]);

    return NextResponse.json({
      ...dbInfo,
      status: 'connected',
      message: 'Successfully connected to PostgreSQL database!',
      counts: {
        users: userCount,
        categories: categoryCount,
        products: productCount,
        variants: variantCount,
        orders: orderCount,
      },
      hasSettings: Boolean(settings),
    });
  } catch (error: any) {
    return NextResponse.json({
      ...dbInfo,
      status: 'error',
      message: error?.message || 'Database connection test failed',
      counts: null,
    });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            'Cannot seed: Database is not configured. Please add your PostgreSQL connection string to .env first.',
        },
        { status: 503 }
      );
    }

    // 1. Seed or update Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'siddreddylakshmankumar@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'VANI@MILK';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: 'Lakshman Kumar Siddireddy',
        role: 'ADMIN',
      },
      create: {
        id: 'admin-root-01',
        name: 'Lakshman Kumar Siddireddy',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
      },
    });

    // 2. Seed Shop Settings
    await prisma.shopSettings.upsert({
      where: { id: 'default-settings' },
      update: {
        shopName: DEFAULT_SHOP_SETTINGS.shopName,
        phone: DEFAULT_SHOP_SETTINGS.phone,
        whatsappNumber: DEFAULT_SHOP_SETTINGS.whatsappNumber,
        address: DEFAULT_SHOP_SETTINGS.address,
        openingHours: DEFAULT_SHOP_SETTINGS.openingHours,
        googleMapsUrl: DEFAULT_SHOP_SETTINGS.googleMapsUrl,
        logoUrl: DEFAULT_SHOP_SETTINGS.logoUrl,
        aboutDescription: DEFAULT_SHOP_SETTINGS.aboutDescription,
        bannerText: DEFAULT_SHOP_SETTINGS.bannerText,
      },
      create: {
        id: 'default-settings',
        shopName: DEFAULT_SHOP_SETTINGS.shopName,
        phone: DEFAULT_SHOP_SETTINGS.phone,
        whatsappNumber: DEFAULT_SHOP_SETTINGS.whatsappNumber,
        address: DEFAULT_SHOP_SETTINGS.address,
        openingHours: DEFAULT_SHOP_SETTINGS.openingHours,
        googleMapsUrl: DEFAULT_SHOP_SETTINGS.googleMapsUrl,
        logoUrl: DEFAULT_SHOP_SETTINGS.logoUrl,
        aboutDescription: DEFAULT_SHOP_SETTINGS.aboutDescription,
        bannerText: DEFAULT_SHOP_SETTINGS.bannerText,
      },
    });

    // 3. Seed Categories
    const categoryMap = new Map<string, string>();
    for (const cat of DEFAULT_CATEGORIES) {
      const record = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, displayOrder: cat.displayOrder },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          displayOrder: cat.displayOrder,
        },
      });
      categoryMap.set(cat.slug, record.id);
    }

    // 4. Seed Products and Variants
    for (const prod of DEFAULT_PRODUCTS) {
      const catSlug = prod.category?.slug || 'other';
      const categoryId = categoryMap.get(catSlug) || Array.from(categoryMap.values())[0];

      const product = await prisma.product.upsert({
        where: { id: prod.id },
        update: {
          name: prod.name,
          categoryId,
          description: prod.description,
          quality: prod.quality,
          imageUrl: prod.imageUrl,
          isActive: prod.isActive,
          isFeatured: prod.isFeatured,
        },
        create: {
          id: prod.id,
          name: prod.name,
          categoryId,
          description: prod.description,
          quality: prod.quality,
          imageUrl: prod.imageUrl,
          isActive: prod.isActive,
          isFeatured: prod.isFeatured,
        },
      });

      for (const v of prod.variants) {
        await prisma.productVariant.upsert({
          where: { id: v.id },
          update: {
            packSize: v.packSize,
            unit: v.unit,
            price: v.price,
            stockQuantity: v.stockQuantity,
            isAvailable: v.isAvailable,
          },
          create: {
            id: v.id,
            productId: product.id,
            packSize: v.packSize,
            unit: v.unit,
            price: v.price,
            stockQuantity: v.stockQuantity,
            isAvailable: v.isAvailable,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL database successfully seeded with all initial data!',
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}
