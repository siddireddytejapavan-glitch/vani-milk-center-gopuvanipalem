import React from 'react';
import { prisma, isDatabaseConfigured } from '@/lib/db';
import { DEFAULT_CATEGORIES } from '@/lib/catalog';
import CategoryManager, { CategoryItem } from './CategoryManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  let categories: CategoryItem[] = [];

  if (isDatabaseConfigured()) {
    try {
      const dbCategories = await prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
      categories = dbCategories as unknown as CategoryItem[];
    } catch (e) {
      console.warn('DB categories query fallback:', e);
      categories = DEFAULT_CATEGORIES.map((c) => ({ ...c, _count: { products: 0 } }));
    }
  } else {
    categories = DEFAULT_CATEGORIES.map((c) => ({ ...c, _count: { products: 0 } }));
  }

  return (
    <div className="space-y-6">
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
