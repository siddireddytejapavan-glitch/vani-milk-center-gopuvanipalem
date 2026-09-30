import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { alertCategoryUpdated } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, displayOrder } = body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (slug !== undefined) {
      data.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (displayOrder !== undefined) data.displayOrder = parseInt(displayOrder, 10) || 0;

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    // Alert shop owner
    alertCategoryUpdated({
      action: 'UPDATED',
      categoryName: category.name,
      slug: category.slug,
      adminName: admin.name,
      adminEmail: admin.email,
    }).catch((e) => console.warn('Category update alert error:', e));

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
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

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const { id } = await params;

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: It contains ${productCount} active product(s). Please move or delete products first.` },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    await prisma.category.delete({
      where: { id },
    });

    if (category) {
      alertCategoryUpdated({
        action: 'DELETED',
        categoryName: category.name,
        slug: category.slug,
        adminName: admin.name,
        adminEmail: admin.email,
      }).catch((e) => console.warn('Category delete alert error:', e));
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
