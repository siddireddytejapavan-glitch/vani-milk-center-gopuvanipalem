import React from 'react';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getShopSettings, getAllProductsAndCategoriesForAdmin } from '@/lib/catalog';
import OrderManager from './OrderManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  if (isDatabaseConfigured()) {
    try {
      orders = await prisma.order.findMany({
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Orders fetch skipped:', error);
      }
    }
  }

  const [settings, catalogData] = await Promise.all([
    getShopSettings(),
    getAllProductsAndCategoriesForAdmin(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <OrderManager
        initialOrders={orders as any}
        shopName={settings?.shopName || 'VANI MILK CENTER, GOPIVANIPALEM'}
        availableProducts={catalogData.products as any}
      />
    </div>
  );
}
