import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { DEFAULT_PRODUCTS } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isDatabaseConfigured()) {
      const fallback = DEFAULT_PRODUCTS.find((p) => p.id === id);
      if (fallback) return NextResponse.json({ product: fallback });
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching product:', error);
    }
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

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured. Products cannot be updated without a database connection.' },
        { status: 503 }
      );
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

    // If categoryId was provided, safely resolve valid category
    let targetCategoryId = existing.categoryId;
    if (categoryId !== undefined && categoryId !== existing.categoryId) {
      let validCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!validCategory) {
        const normalizedSlug = categoryId.replace(/^cat-/, '').toLowerCase();
        validCategory = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: normalizedSlug },
              { name: { contains: normalizedSlug } },
              { slug: categoryId.toLowerCase() },
            ],
          },
        });
      }

      if (validCategory) {
        targetCategoryId = validCategory.id;
      }
    }

    // Update product base fields
    await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        categoryId: targetCategoryId,
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

    // Invalidate customer storefront and admin products page caches
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');

    const res = NextResponse.json({
      message: 'Product updated successfully',
      product: updated,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
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

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured. Products cannot be deleted without a database connection.' },
        { status: 503 }
      );
    }

    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Product already deleted or removed' });
    }

    // Atomic transaction for safe product and variant deletion with FK cleanup
    await prisma.$transaction(async (tx) => {
      // 1. Get all variants of this product
      const variants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);

      // 2. Disconnect order items to prevent foreign key constraint violations
      if (variantIds.length > 0) {
        await tx.orderItem.updateMany({
          where: { variantId: { in: variantIds } },
          data: { variantId: null, productId: null },
        });
      }
      await tx.orderItem.updateMany({
        where: { productId: id },
        data: { productId: null, variantId: null },
      });

      // 3. Delete product variants
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // 4. Delete the product record
      await tx.product.delete({
        where: { id },
      });
    });

    // Invalidate customer storefront and admin products page caches
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');

    const res = NextResponse.json({ message: 'Product deleted successfully' });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
