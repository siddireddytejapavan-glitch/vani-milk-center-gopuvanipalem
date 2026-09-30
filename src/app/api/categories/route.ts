import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { DEFAULT_CATEGORIES } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.warn('Failed to fetch categories:', error?.message);
    return NextResponse.json({ categories: DEFAULT_CATEGORIES });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database is not yet connected. Please configure your Supabase connection.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { name, slug, displayOrder = 0 } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check duplicate
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug: generatedSlug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A category with this name or slug already exists.' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        displayOrder: parseInt(displayOrder, 10) || 0,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
