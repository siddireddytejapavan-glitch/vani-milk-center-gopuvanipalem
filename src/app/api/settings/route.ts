import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { cleanWhatsAppNumber } from '@/lib/whatsapp';
import { DEFAULT_SHOP_SETTINGS } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!isDatabaseConfigured()) {
    const res = NextResponse.json({ settings: DEFAULT_SHOP_SETTINGS });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  }

  try {
    let settings = await prisma.shopSettings.findUnique({
      where: { id: 'default-settings' },
    });

    if (!settings) {
      settings = await prisma.shopSettings.create({
        data: {
          id: 'default-settings',
          shopName: 'VANI MILK CENTER, GOPUVANIPALEM',
          phone: '7995597719',
          whatsappNumber: '917995597719',
          address: '659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002',
          openingHours: 'Morning 5:00 AM - Evening 10:00 PM',
          googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002',
          logoUrl: '/images/shop-logo.svg',
          aboutDescription: 'Welcome to Vani Milk Center, Gopuvanipalem. We provide 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
          bannerText: '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
        },
      });
    }

    const response = NextResponse.json({ settings });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Database error in /api/settings, returning default settings:', (error as any)?.message || error);
    }
    const res = NextResponse.json({ settings: DEFAULT_SHOP_SETTINGS });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured. Settings cannot be saved without a database connection. Please set up DATABASE_URL in your .env file.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      shopName,
      phone,
      whatsappNumber,
      address,
      openingHours,
      googleMapsUrl,
      logoUrl,
      aboutDescription,
      bannerText,
    } = body;

    if (!shopName || !phone || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Shop name, phone, and WhatsApp number are required.' },
        { status: 400 }
      );
    }

    const cleanedWhatsApp = cleanWhatsAppNumber(whatsappNumber || '');

    const updated = await prisma.shopSettings.upsert({
      where: { id: 'default-settings' },
      update: {
        shopName: shopName || 'VANI MILK CENTER, GOPUVANIPALEM',
        phone: phone || '7995597719',
        whatsappNumber: cleanedWhatsApp || '917995597719',
        address: address || '659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002',
        openingHours: openingHours || 'Morning 5:00 AM - Evening 10:00 PM',
        googleMapsUrl: googleMapsUrl || 'https://www.google.com/maps/search/?api=1&query=659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002',
        logoUrl: logoUrl || '/images/shop-logo.svg',
        aboutDescription: aboutDescription || 'Welcome to Vani Milk Center, Gopuvanipalem.',
        bannerText: bannerText || '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
      },
      create: {
        id: 'default-settings',
        shopName: shopName || 'VANI MILK CENTER, GOPUVANIPALEM',
        phone: phone || '7995597719',
        whatsappNumber: cleanedWhatsApp || '917995597719',
        address: address || '659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002',
        openingHours: openingHours || 'Morning 5:00 AM - Evening 10:00 PM',
        googleMapsUrl: googleMapsUrl || 'https://www.google.com/maps/search/?api=1&query=659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002',
        logoUrl: logoUrl || '/images/shop-logo.svg',
        aboutDescription: aboutDescription || 'Welcome to Vani Milk Center, Gopuvanipalem.',
        bannerText: bannerText || '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
      },
    });

    // Invalidate server caches so all customer pages see the updated settings immediately
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/cart');
    revalidatePath('/admin/settings');

    const res = NextResponse.json({
      message: 'Shop settings updated successfully',
      settings: updated,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update shop settings. Please check your database connection.' },
      { status: 500 }
    );
  }
}
