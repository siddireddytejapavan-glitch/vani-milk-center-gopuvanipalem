import React from 'react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import FloatingWhatsApp from '@/components/customer/FloatingWhatsApp';
import CartDrawer from '@/components/customer/CartDrawer';
import ProductsClientView from './ProductsClientView';
import { getAllProductsAndCategories } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const { products, categories } = await getAllProductsAndCategories();

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <CartDrawer />
      <FloatingWhatsApp />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
              Full Fresh Catalogue
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              Our Milk &amp; Dairy Products
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Select your required pack size, quantity, and add directly to your cart for instant WhatsApp ordering.
            </p>
          </div>

          {/* Interactive Client Search, Category Filter & Product Grid */}
          <ProductsClientView
            initialProducts={products as any}
            categories={categories}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
