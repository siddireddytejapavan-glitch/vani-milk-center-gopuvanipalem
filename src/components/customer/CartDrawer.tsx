'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatINR } from '@/lib/utils';

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    totalAmount,
    totalItems,
  } = useCart();
  const { t } = useLanguage();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-sky-600" />
              <h2 className="font-bold text-slate-800 text-lg">
                {t('cart.title', 'Your Cart')}
              </h2>
              <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-500">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {t('cart.empty', 'Your cart is empty')}
                </h3>
                <p className="text-slate-500 text-sm mt-1 mb-6 max-w-xs mx-auto">
                  {t(
                    'cart.emptyDesc',
                    'Add fresh milk, thick curd buckets, or buttermilk to get started.'
                  )}
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {t('products.all', 'Browse Dairy Products')}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                    <Image
                      src={item.imageUrl || '/images/default-dairy.jpg'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info & Quantity controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm truncate">
                          {item.productName}
                        </h4>
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 mt-0.5">
                          {item.packSize}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                      {/* Price per unit */}
                      <span className="text-xs text-slate-500">
                        {formatINR(item.unitPrice)}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center space-x-2 bg-white rounded-lg border border-slate-200 px-1 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold text-slate-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.stockQuantity <= item.quantity}
                          className="p-1 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded disabled:opacity-40 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="font-bold text-slate-900 text-sm">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.subtotal', 'Subtotal')} ({totalItems} items)</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.delivery', 'Delivery / Pickup')}</span>
                  <span className="text-emerald-700 font-semibold">{t('cart.free', 'Free Shop Pickup')}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 text-lg pt-2 border-t border-slate-200">
                  <span>{t('cart.total', 'Order Total')}</span>
                  <span className="text-sky-700">{formatINR(totalAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow hover:shadow-md transition-all active:scale-98"
                >
                  <span>{t('cart.checkoutBtn', 'Proceed to Checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors text-center cursor-pointer"
                >
                  {t('cart.continue', 'Continue Shopping')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
