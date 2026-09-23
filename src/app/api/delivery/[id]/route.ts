import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        order: {
          id,
          customerName: 'Customer',
          customerPhone: '',
          address: 'Gopuvanipalem, Andhra Pradesh',
          totalAmount: 0,
          status: 'Confirmed',
          items: [],
        },
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: order.address,
        totalAmount: order.totalAmount,
        status: order.status,
        notes: order.notes,
        createdAt: order.createdAt,
        items: order.items,
      },
    });
  } catch (error: any) {
    console.error('Error fetching delivery order details:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load order for delivery' },
      { status: 500 }
    );
  }
}
