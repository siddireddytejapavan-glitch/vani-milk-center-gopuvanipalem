import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import Hero from '@/components/customer/Hero';
import BulkOrderBanner from '@/components/customer/BulkOrderBanner';
import WhyChooseUs from '@/components/customer/WhyChooseUs';
import ContactSection from '@/components/customer/ContactSection';
import FloatingWhatsApp from '@/components/customer/FloatingWhatsApp';
import CartDrawer from '@/components/customer/CartDrawer';
import ProductCard from '@/components/customer/ProductCard';
import { getFeaturedProductsAndCategories } from '@/lib/catalog';
import { ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Resilient fetch with automatic fallback if database is cold-starting or connecting
  const { products: featuredProducts, categories } = await getFeaturedProductsAndCategories();

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <CartDrawer />
      <FloatingWhatsApp />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Quick Category Bar */}
        <section className="bg-white/85 backdrop-blur-md py-6 border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 shrink-0">
                Categories:
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/products"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors shrink-0 shadow-xs"
                >
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-colors shrink-0 border border-slate-200"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 shrink-0"
              >
                <span>Full Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Featured & Popular Products */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fresh Daily Selection</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Popular Dairy Products
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Select pack sizes from 250ml sachets to 20kg bulk buckets.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 font-extrabold text-sm text-sky-600 hover:text-sky-800 transition-colors"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Special Function / Bulk Orders Banner */}
        <BulkOrderBanner />

        {/* 5. Why Choose Us Trust Section */}
        <WhyChooseUs />

        {/* 6. Shop Location & Contact Section */}
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
