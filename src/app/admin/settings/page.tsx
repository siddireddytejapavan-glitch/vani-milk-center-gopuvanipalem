import React from 'react';
import { prisma } from '@/lib/db';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
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

  return (
    <div className="max-w-4xl mx-auto">
      <SettingsForm initialSettings={settings as any} />
    </div>
  );
}
