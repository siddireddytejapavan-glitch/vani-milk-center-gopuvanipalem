import React from 'react';
import { getAllProductsAndCategories } from '@/lib/catalog';
import ProductManager from './ProductManager';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const { products, categories } = await getAllProductsAndCategories();

  return (
    <div className="max-w-7xl mx-auto">
      <ProductManager
        initialProducts={products as any}
        categories={categories}
      />
    </div>
  );
}
