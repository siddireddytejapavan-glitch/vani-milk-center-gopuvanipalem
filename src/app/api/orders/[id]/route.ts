import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const VALID_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Delivered',
  'Cancelled',
];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        message: 'Order status updated successfully',
        order: { id, status },
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    revalidatePath('/admin/orders');
    revalidatePath('/admin');

    const res = NextResponse.json({
      message: 'Order status updated successfully',
      order: updated,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching order details:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ message: 'Order deleted successfully' });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Order already deleted or removed' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });
      await tx.order.delete({
        where: { id },
      });
    });

    revalidatePath('/admin/orders');
    revalidatePath('/admin');

    const res = NextResponse.json({ message: 'Order deleted successfully' });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
