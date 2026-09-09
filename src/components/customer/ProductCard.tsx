'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';

export interface VariantType {
  id: string;
  packSize: string;
  unit: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface ProductType {
  id: string;
  name: string;
  description: string;
  quality: string;
  imageUrl: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  variants: VariantType[];
}

export default function ProductCard({ product }: { product: ProductType }) {
  const { addItem } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const currentVariant =
    product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIndex] || product.variants[0]
      : null;

  const isOutOfStock =
    !currentVariant ||
    !currentVariant.isAvailable ||
    currentVariant.stockQuantity <= 0;

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;

    addItem({
      variantId: currentVariant.id,
      productId: product.id,
      productName: product.name,
      packSize: currentVariant.packSize,
      unitPrice: currentVariant.price,
      quantity: quantity,
      imageUrl: product.imageUrl || '/images/default-dairy.jpg',
      stockQuantity: currentVariant.stockQuantity,
      categoryName: product.category?.name,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleIncrement = () => {
    if (!currentVariant) return;
    if (quantity < currentVariant.stockQuantity) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  // Switch variant
  const handleSelectVariant = (index: number) => {
    setSelectedVariantIndex(index);
    setQuantity(1); // Reset quantity on variant switch
  };

  return (
    <div className="group bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Product Image Container */}
      <div className="relative h-60 w-full bg-slate-100/60 overflow-hidden">
        <Image
          src={product.imageUrl || '/images/default-dairy.jpg'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          unoptimized={Boolean(product.imageUrl?.startsWith('data:'))}
        />

        {/* Category Pill */}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {product.category.name}
          </span>
        )}

        {/* Quality Badge */}
        {product.quality && (
          <span className="absolute top-3 right-3 bg-emerald-600/95 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse"></span>
            {product.quality}
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="bg-rose-600 text-white font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow">
              Currently Unavailable / Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Select Pack Size:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((variant, idx) => {
                const isSelected = idx === selectedVariantIndex;
                const isVOutOfStock = !variant.isAvailable || variant.stockQuantity <= 0;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleSelectVariant(idx)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-600 border-sky-600 text-white shadow-sm ring-2 ring-sky-200'
                        : isVOutOfStock
                        ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {variant.packSize}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Price & Quantity & Add to Cart */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900">
                {currentVariant ? formatINR(currentVariant.price) : '—'}
              </span>
              <span className="text-xs text-slate-500 ml-1">
                / {currentVariant?.packSize || 'pack'}
              </span>
            </div>

            {/* Stock indicator */}
            <div className="text-right">
              {currentVariant && !isOutOfStock && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  In Stock ({currentVariant.stockQuantity})
                </span>
              )}
            </div>
          </div>

          {/* Quantity stepper and Add button */}
          <div className="flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isOutOfStock}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-50 active:scale-95 disabled:opacity-40 shadow-xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-9 text-center font-extrabold text-sm text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={isOutOfStock || (currentVariant && quantity >= currentVariant.stockQuantity)}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-50 active:scale-95 disabled:opacity-40 shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-lg'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" />
                  <span>Added to Cart!</span>
                </>
              ) : isOutOfStock ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Out of Stock</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
