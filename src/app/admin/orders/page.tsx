import React from 'react';
import { prisma } from '@/lib/db';
import OrderManager from './OrderManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.shopSettings.findUnique({
      where: { id: 'default-settings' },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <OrderManager
        initialOrders={orders as any}
        shopName={settings?.shopName || 'VANI MILK CENTER, GOPIVANIPALEM'}
      />
    </div>
  );
}
