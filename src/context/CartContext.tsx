'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  packSize: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  stockQuantity: number;
  categoryName?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'vani_milk_center_cart_v1';
const LEGACY_CART_STORAGE_KEY = 'sri_krishna_dairy_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(LEGACY_CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items, isInitialized]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.variantId === newItem.variantId);
      if (index > -1) {
        const updated = [...prev];
        const newQty = updated[index].quantity + newItem.quantity;
        // Cap at stockQuantity if stock is defined
        updated[index].quantity = Math.min(newQty, newItem.stockQuantity || 999);
        return updated;
      } else {
        return [...prev, newItem];
      }
    });
    // Automatically open drawer to confirm addition
    setIsDrawerOpen(true);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.variantId === variantId) {
          const validQty = Math.min(quantity, item.stockQuantity || 999);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalAmount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
