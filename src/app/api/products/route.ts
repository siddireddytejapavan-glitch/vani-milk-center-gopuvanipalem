import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { getAllProductsAndCategories } from '@/lib/catalog';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const isAdmin = searchParams.get('admin') === 'true';

    // If requesting admin view, verify session
    if (isAdmin) {
      const admin = await getCurrentAdmin();
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.isActive = true;
    }

    if (categorySlug && categorySlug !== 'all') {
      whereClause.category = { slug: categorySlug };
    }

    if (search && search.trim()) {
      const query = search.trim();
      whereClause.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { quality: { contains: query } },
        { variants: { some: { packSize: { contains: query } } } },
      ];
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          variants: {
            orderBy: { price: 'asc' },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.warn('Failed to fetch products from DB, returning resilient defaults:', (error as any)?.message || error);
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const fallback = await getAllProductsAndCategories(categorySlug, search);
    return NextResponse.json({ products: fallback.products, categories: fallback.categories });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      categoryId,
      description,
      quality,
      imageUrl,
      isActive = true,
      isFeatured = false,
      variants = [],
    } = body;

    if (!name || !categoryId || !description) {
      return NextResponse.json(
        { error: 'Name, category, and description are required' },
        { status: 400 }
      );
    }

    if (!variants || variants.length === 0) {
      return NextResponse.json(
        { error: 'At least one variant/pack size is required' },
        { status: 400 }
      );
    }

    // Create product and its variants in a single transaction
    const newProduct = await prisma.product.create({
      data: {
        name,
        categoryId,
        description,
        quality: quality || 'Fresh Quality Dairy',
        imageUrl: imageUrl || '/images/default-dairy.jpg',
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        variants: {
          create: variants.map((v: any) => ({
            packSize: v.packSize,
            unit: v.unit || 'unit',
            price: parseFloat(v.price) || 0,
            stockQuantity: parseInt(v.stockQuantity, 10) || 0,
            isAvailable: v.isAvailable !== false,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(
      { message: 'Product created successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
