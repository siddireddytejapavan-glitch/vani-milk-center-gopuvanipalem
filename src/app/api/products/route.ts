import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { getAllProductsAndCategories } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const isAdmin = searchParams.get('admin') === 'true';

  // If requesting admin view, verify session
  if (isAdmin) {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!isDatabaseConfigured()) {
    const fallback = await getAllProductsAndCategories(categorySlug, search);
    return NextResponse.json({ products: fallback.products, categories: fallback.categories });
  }

  try {
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

    const res = NextResponse.json({ products, categories });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to fetch products from DB, returning resilient defaults:', (error as any)?.message || error);
    }
    const fallback = await getAllProductsAndCategories(categorySlug, search);
    const res = NextResponse.json({ products: fallback.products, categories: fallback.categories });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not configured. Products cannot be created without a database connection.' },
        { status: 503 }
      );
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

    // Resolve valid category by ID, slug, or fallback to first available category
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

    if (!validCategory) {
      validCategory = await prisma.category.findFirst({
        orderBy: { displayOrder: 'asc' },
      });
    }

    const targetCategoryId = validCategory ? validCategory.id : categoryId;

    // Create product and its variants in a single transaction
    const newProduct = await prisma.product.create({
      data: {
        name,
        categoryId: targetCategoryId,
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

    // Invalidate customer storefront and admin products page caches
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');

    const res = NextResponse.json(
      { message: 'Product created successfully', product: newProduct },
      { status: 201 }
    );
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res;
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
