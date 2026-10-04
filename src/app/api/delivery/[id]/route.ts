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
          deliveryCharge: 0,
          customerLat: 16.4350,
          customerLng: 81.1200,
          shopLat: 16.4307,
          shopLng: 81.1167,
          deliveryLat: null,
          deliveryLng: null,
          deliveryUpdatedAt: null,
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
        deliveryCharge: order.deliveryCharge,
        customerLat: order.customerLat,
        customerLng: order.customerLng,
        shopLat: order.shopLat ?? 16.4307,
        shopLng: order.shopLng ?? 81.1167,
        deliveryLat: order.deliveryLat,
        deliveryLng: order.deliveryLng,
        deliveryUpdatedAt: order.deliveryUpdatedAt,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { deliveryLat, deliveryLng, status } = body;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Live location updated (demo mode)',
        location: { deliveryLat, deliveryLng, status, deliveryUpdatedAt: new Date() },
      });
    }

    const updateData: any = {
      deliveryUpdatedAt: new Date(),
    };

    if (typeof deliveryLat === 'number' && !isNaN(deliveryLat)) {
      updateData.deliveryLat = deliveryLat;
    }
    if (typeof deliveryLng === 'number' && !isNaN(deliveryLng)) {
      updateData.deliveryLng = deliveryLng;
    }
    if (status && typeof status === 'string') {
      updateData.status = status;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Live location saved successfully',
      order: {
        id: updatedOrder.id,
        deliveryLat: updatedOrder.deliveryLat,
        deliveryLng: updatedOrder.deliveryLng,
        deliveryUpdatedAt: updatedOrder.deliveryUpdatedAt,
        status: updatedOrder.status,
      },
    });
  } catch (error: any) {
    console.error('Error updating live delivery location:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update live delivery coordinates' },
      { status: 500 }
    );
  }
}
