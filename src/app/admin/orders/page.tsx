import React from 'react';
import { prisma } from '@/lib/db';
import { getShopSettings } from '@/lib/catalog';
import OrderManager from './OrderManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.warn('Orders fetch skipped:', error);
  }

  const settings = await getShopSettings();

  return (
    <div className="max-w-7xl mx-auto">
      <OrderManager
        initialOrders={orders as any}
        shopName={settings?.shopName || 'VANI MILK CENTER, GOPIVANIPALEM'}
      />
    </div>
  );
}
