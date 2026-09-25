'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ShopSettingsData {
  shopName: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  openingHours: string;
  googleMapsUrl: string;
  logoUrl: string;
  aboutDescription: string;
  bannerText: string;
}

const defaultSettings: ShopSettingsData = {
  shopName: 'VANI MILK CENTER, GOPUVANIPALEM',
  phone: '7995597719',
  whatsappNumber: '917995597719',
  address: '659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002',
  openingHours: 'Morning 5:00 AM - Evening 10:00 PM',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002',
  logoUrl: '/images/shop-logo.svg',
  aboutDescription: 'Welcome to Vani Milk Center, Gopuvanipalem. We deliver 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
  bannerText: '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
};

const ShopSettingsContext = createContext<{
  settings: ShopSettingsData;
  refreshSettings: () => Promise<void>;
}>({
  settings: defaultSettings,
  refreshSettings: async () => {},
});

export const ShopSettingsProvider: React.FC<{
  initialSettings?: ShopSettingsData;
  children: React.ReactNode;
}> = ({ initialSettings, children }) => {
  const [settings, setSettings] = useState<ShopSettingsData>(initialSettings || defaultSettings);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (e) {
      console.error('Failed to fetch shop settings', e);
    }
  };

  useEffect(() => {
    refreshSettings();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vani_shop_settings_timestamp') {
        refreshSettings();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ShopSettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </ShopSettingsContext.Provider>
  );
};

export function useShopSettings() {
  return useContext(ShopSettingsContext);
}
