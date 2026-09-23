'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MessageCircle, Menu, X, Phone, Clock, MapPin, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { generateEnquiryWhatsAppLink } from '@/lib/whatsapp';
import AdminLoginModal from '@/components/customer/AdminLoginModal';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const { totalItems, setIsDrawerOpen } = useCart();
  const { settings } = useShopSettings();
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products & Prices', href: '/products' },
    { name: 'Function / Bulk Orders', href: '/#functions' },
    { name: 'About Our Dairy', href: '/about' },
    { name: 'Contact & Location', href: '/contact' },
  ];

  const whatsAppLink = generateEnquiryWhatsAppLink(settings.whatsappNumber);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-emerald-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-200" />
              {settings.openingHours || 'Daily: 5:00 AM - 10:00 PM'}
            </span>
            <span className="hidden md:inline text-sky-300">•</span>
            <Link
              href="/contact"
              className="hidden md:flex items-center gap-1 hover:text-sky-200 transition-colors font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>📍 659J+CX2 Gopuvanipalem, AP 521002</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 font-medium">
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 hover:text-sky-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              <span>Call: {settings.phone}</span>
            </a>
            <span className="hidden sm:inline text-sky-300">•</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1 text-sky-100 hover:text-white transition-colors cursor-pointer bg-sky-900/40 hover:bg-sky-900/70 px-2.5 py-0.5 rounded-full border border-sky-400/30"
            >
              <Shield className="w-3 h-3 text-emerald-300" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-14 w-32 sm:w-36 rounded-xl bg-white p-1 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Image
                src={settings.logoUrl || '/images/shop-logo.svg'}
                alt={settings.shopName}
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <span className="block font-black text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-emerald-700 transition-colors">
                {settings.shopName}
              </span>
              <span className="block text-[11px] font-bold text-emerald-700 tracking-wider uppercase">
                ★ Quality Milk Products ★
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-700 hover:text-sky-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Cart, WhatsApp & Admin Login */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* WhatsApp CTA Button */}
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Us</span>
            </a>

            {/* Shopping Cart Button with Count Badge */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="View Shopping Cart"
              className="relative p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin Login Button */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              aria-label="Shop Owner & Admin Login"
              title="Admin Login (Staff & Shop Owner)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer border border-slate-700/60"
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open mobile menu"
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-sky-50 hover:text-sky-700 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-base shadow active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              Order on WhatsApp
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAdminModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow active:scale-98 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Shop Owner / Admin Login</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Login Modal Accessible from Customer Storefront */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </header>
  );
}
