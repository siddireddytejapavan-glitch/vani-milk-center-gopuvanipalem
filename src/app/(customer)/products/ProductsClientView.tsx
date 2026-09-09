'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, PackageSearch } from 'lucide-react';
import ProductCard, { ProductType } from '@/components/customer/ProductCard';

interface CategoryType {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsClientView({
  initialProducts,
  categories,
}: {
  initialProducts: ProductType[];
  categories: CategoryType[];
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'newest'>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category?.slug === selectedCategory);
    }

    // In Stock Only Filter
    if (inStockOnly) {
      list = list.filter((p) =>
        p.variants.some((v) => v.isAvailable && v.stockQuantity > 0)
      );
    }

    // Search query filter (matches name, description, quality, or pack sizes e.g. "10 kg", "Curd", "Milk")
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const qualityMatch = p.quality.toLowerCase().includes(q);
        const variantMatch = p.variants.some((v) =>
          v.packSize.toLowerCase().includes(q)
        );
        return nameMatch || descMatch || qualityMatch || variantMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      const aPrices = a.variants?.map((v) => v.price) || [];
      const bPrices = b.variants?.map((v) => v.price) || [];
      const aMinPrice = aPrices.length > 0 ? Math.min(...aPrices) : 0;
      const bMinPrice = bPrices.length > 0 ? Math.min(...bPrices) : 0;

      if (sortBy === 'price-asc') {
        return aMinPrice - bMinPrice;
      }
      if (sortBy === 'price-desc') {
        return bMinPrice - aMinPrice;
      }
      // 'popular' or default maintains seed ranking (curated/featured first)
      return 0;
    });

    return list;
  }, [initialProducts, selectedCategory, searchQuery, sortBy, inStockOnly]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Bar */}
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Milk, Curd, 10 kg bucket, Buttermilk, Lassi..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="popular">Sort: Popular &amp; Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* In-stock toggle */}
          <div className="md:col-span-3 flex items-center justify-start md:justify-end">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories ({initialProducts.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = initialProducts.filter(
              (p) => p.category?.slug === cat.slug
            ).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>
          Showing {filteredProducts.length} of {initialProducts.length} dairy products
        </span>
        {(searchQuery || selectedCategory !== 'all' || inStockOnly) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setInStockOnly(false);
            }}
            className="text-sky-600 hover:text-sky-800 underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-600">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No dairy products found</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            We couldn&apos;t find any products matching &ldquo;{searchQuery}&rdquo;. Try searching for Milk, Curd, or Buttermilk.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setInStockOnly(false);
            }}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
