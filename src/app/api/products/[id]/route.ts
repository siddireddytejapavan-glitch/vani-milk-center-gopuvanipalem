import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

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
    const {
      name,
      categoryId,
      description,
      quality,
      imageUrl,
      isActive,
      isFeatured,
      variants,
    } = body;

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product base fields
    await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        description: description !== undefined ? description : existing.description,
        quality: quality !== undefined ? quality : existing.quality,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
      },
    });

    // If variants were provided, sync them
    if (variants && Array.isArray(variants)) {
      const incomingVariantIds = variants
        .map((v: any) => v.id)
        .filter((vid: string) => Boolean(vid));

      const toDelete = await prisma.productVariant.findMany({
        where: {
          productId: id,
          id: { notIn: incomingVariantIds },
        },
        select: { id: true },
      });
      const toDeleteIds = toDelete.map((v) => v.id);
      if (toDeleteIds.length > 0) {
        await prisma.orderItem.updateMany({
          where: { variantId: { in: toDeleteIds } },
          data: { variantId: null },
        });
        await prisma.productVariant.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      // Upsert/update variants
      for (const v of variants) {
        const parsedPrice = parseFloat(v.price) || 0;
        const parsedStock = parseInt(v.stockQuantity, 10) || 0;
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              packSize: v.packSize,
              unit: v.unit || 'unit',
              price: parsedPrice,
              stockQuantity: parsedStock,
              isAvailable: v.isAvailable !== false,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              packSize: v.packSize,
              unit: v.unit || 'unit',
              price: parsedPrice,
              stockQuantity: parsedStock,
              isAvailable: v.isAvailable !== false,
            },
          });
        }
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Disconnect order items to prevent foreign key constraint violations
    await prisma.orderItem.updateMany({
      where: { productId: id },
      data: { productId: null, variantId: null },
    });

    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
