import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { cleanWhatsAppNumber } from '@/lib/whatsapp';
import { DEFAULT_SHOP_SETTINGS } from '@/lib/catalog';

export async function GET() {
  try {
    let settings = await prisma.shopSettings.findUnique({
      where: { id: 'default-settings' },
    });

    if (!settings) {
      settings = await prisma.shopSettings.create({
        data: {
          id: 'default-settings',
          shopName: 'VANI MILK CENTER, GOPIVANIPALEM',
          phone: '7995597719',
          whatsappNumber: '917995597719',
          address: 'Gopivanipalem, Andhra Pradesh',
          openingHours: 'Morning 5:00 AM - Evening 10:00 PM',
          googleMapsUrl: 'https://maps.google.com/?q=Gopivanipalem',
          logoUrl: '/images/shop-logo.svg',
          aboutDescription: 'Welcome to Vani Milk Center, Gopivanipalem. We provide 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
          bannerText: '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.warn('Database error in /api/settings, returning default settings:', (error as any)?.message || error);
    return NextResponse.json({ settings: DEFAULT_SHOP_SETTINGS });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const cleanedWhatsApp = cleanWhatsAppNumber(whatsappNumber || '');

    const updated = await prisma.shopSettings.upsert({
      where: { id: 'default-settings' },
      update: {
        shopName: shopName || 'VANI MILK CENTER, GOPIVANIPALEM',
        phone: phone || '7995597719',
        whatsappNumber: cleanedWhatsApp || '917995597719',
        address: address || 'Gopivanipalem, Andhra Pradesh',
        openingHours: openingHours || 'Morning 5:00 AM - Evening 10:00 PM',
        googleMapsUrl: googleMapsUrl || 'https://maps.google.com/?q=Gopivanipalem',
        logoUrl: logoUrl || '/images/shop-logo.svg',
        aboutDescription: aboutDescription || 'Welcome to Vani Milk Center, Gopivanipalem.',
        bannerText: bannerText || '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
      },
      create: {
        id: 'default-settings',
        shopName: shopName || 'VANI MILK CENTER, GOPIVANIPALEM',
        phone: phone || '7995597719',
        whatsappNumber: cleanedWhatsApp || '917995597719',
        address: address || 'Gopivanipalem, Andhra Pradesh',
        openingHours: openingHours || 'Morning 5:00 AM - Evening 10:00 PM',
        googleMapsUrl: googleMapsUrl || 'https://maps.google.com/?q=Gopivanipalem',
        logoUrl: logoUrl || '/images/shop-logo.svg',
        aboutDescription: aboutDescription || 'Welcome to Vani Milk Center, Gopivanipalem.',
        bannerText: bannerText || '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
      },
    });

    return NextResponse.json({
      message: 'Shop settings updated successfully',
      settings: updated,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update shop settings' },
      { status: 500 }
    );
  }
}
