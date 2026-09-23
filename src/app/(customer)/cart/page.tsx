'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Phone,
  MapPin,
  User,
  FileText,
  Navigation,
  ExternalLink,
  Check,
} from 'lucide-react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import FloatingWhatsApp from '@/components/customer/FloatingWhatsApp';
import { useCart } from '@/context/CartContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatINR } from '@/lib/utils';
import { generateDeliveryRouteUrl } from '@/lib/whatsapp';

export default function CartCheckoutPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalItems } = useCart();
  const { settings } = useShopSettings();
  const { t } = useLanguage();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // GPS Live Location State
  const [isLocating, setIsLocating] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    url: string;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    whatsAppLink: string;
    whatsAppMessage: string;
    totalAmount: number;
    deliveryRouteUrl?: string;
    liveLocationUrl?: string;
    address: string;
    customerName: string;
  } | null>(null);

  // Geolocation detection handler
  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Detecting your live GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;

        setGpsLocation({ lat, lng, accuracy, url: mapUrl });
        setIsLocating(false);
        setLocationStatus(`Live GPS captured (accuracy ±${Math.round(accuracy)}m)`);

        const locationTag = `[📍 GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}]`;
        if (!address.trim()) {
          setAddress(`Live Location: ${locationTag}`);
        } else if (!address.includes(locationTag)) {
          setAddress((prev) => `${prev.trim()}\n${locationTag}`);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location permission denied. Please enable GPS permissions or enter your address manually.');
        } else {
          setLocationStatus('Unable to retrieve GPS location. Please enter your address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add dairy products before submitting.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter your delivery or shop pickup address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // POST to backend API for server-side verification of prices, stock, and route generation
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          address: address.trim(),
          notes: notes.trim() || undefined,
          latitude: gpsLocation?.lat,
          longitude: gpsLocation?.lng,
          liveLocationUrl: gpsLocation?.url,
          items: items.map((i) => ({
            variantId: i.variantId,
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Order created successfully on server
      setCompletedOrder({
        orderId: data.order.id,
        whatsAppLink: data.whatsAppLink,
        whatsAppMessage: data.whatsAppMessage,
        totalAmount: data.order.totalAmount,
        deliveryRouteUrl: data.deliveryRouteUrl || generateDeliveryRouteUrl(address.trim(), gpsLocation?.lat, gpsLocation?.lng),
        liveLocationUrl: data.liveLocationUrl || gpsLocation?.url,
        address: address.trim(),
        customerName: customerName.trim(),
      });

      // Clear the local shopping cart
      clearCart();

      // Open WhatsApp automatically in new tab
      if (data.whatsAppLink) {
        window.open(data.whatsAppLink, '_blank');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryDestination =
    (gpsLocation ? `${gpsLocation.lat},${gpsLocation.lng}` : null) ||
    completedOrder?.address ||
    'Gopuvanipalem, Andhra Pradesh';

  const embedRouteUrl = `https://maps.google.com/maps?saddr=659J%2BCX2+Vani+milk,+Gopuvanipalem,+Andhra+Pradesh+521002&daddr=${encodeURIComponent(
    deliveryDestination
  )}&output=embed`;

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <FloatingWhatsApp />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping Dairy Products</span>
              </Link>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Review Order &amp; WhatsApp Checkout
              </h1>
            </div>

            {items.length > 0 && !completedOrder && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline self-start sm:self-auto cursor-pointer"
              >
                Clear entire cart
              </button>
            )}
          </div>

          {/* Success State Screen with Live Delivery Route & Order Tracking */}
          {completedOrder ? (
            <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 sm:p-10 max-w-3xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Order Successfully Verified &amp; Created
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                  Your Order is Ready to Send on WhatsApp!
                </h2>
                <p className="text-slate-600 text-sm mt-2">
                  Order Ref: <span className="font-mono font-bold text-slate-900">#{completedOrder.orderId.slice(-6).toUpperCase()}</span> • Total: <span className="font-extrabold text-emerald-700">{formatINR(completedOrder.totalAmount)}</span>
                </p>
              </div>

              {/* Delivery Boy Navigation & Order Tracking Card */}
              <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 text-left space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      🛵 Live Delivery Route from Shop
                    </h3>
                  </div>
                  {completedOrder.deliveryRouteUrl && (
                    <a
                      href={completedOrder.deliveryRouteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open Turn-by-Turn Route</span>
                    </a>
                  )}
                </div>

                {/* Origin to Destination badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Shop Origin (Pickup)
                    </span>
                    <p className="font-extrabold text-slate-800">Vani Milk Center</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      659J+CX2, Gopuvanipalem, AP 521002
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Customer Delivery Location
                    </span>
                    <p className="font-extrabold text-slate-800">{completedOrder.customerName}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                      {completedOrder.address}
                    </p>
                    {completedOrder.liveLocationUrl && (
                      <a
                        href={completedOrder.liveLocationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:underline font-bold mt-1"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Live GPS Pin Active</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Embedded Interactive Route Map */}
                <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                  <iframe
                    title="Delivery Route from Vani Milk Center"
                    src={embedRouteUrl}
                    width="100%"
                    height="100%"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* 4-Step Order Status Timeline */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-600 mb-2">Delivery Status Progress:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      ✓ Order Placed
                    </div>
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-800 font-bold border border-sky-200">
                      ● Stock Reserved
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600 font-medium">
                      3. Out for Delivery
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600 font-medium">
                      4. Delivered
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Preview */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Generated WhatsApp Message for Owner:
                </p>
                <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200 overflow-x-auto max-h-44">
                  {completedOrder.whatsAppMessage}
                </pre>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={completedOrder.whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Send Order on WhatsApp to Shop Owner</span>
                </a>

                <p className="text-xs text-slate-500">
                  If WhatsApp did not open automatically, click the green button above to send your pre-filled order directly to {settings.shopName}.
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/products"
                    className="inline-block text-sm font-bold text-sky-600 hover:text-sky-800"
                  >
                    ← Place Another Dairy Order
                  </Link>
                </div>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart Screen */
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-md mx-auto shadow-sm space-y-4">
              <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto text-sky-600">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Your Cart is Empty</h3>
              <p className="text-slate-500 text-sm">
                You have not added any dairy products to your cart yet.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow transition-colors"
              >
                <span>Browse Products &amp; Prices</span>
              </Link>
            </div>
          ) : (
            /* Main Checkout Grid: Cart Items (Left) + Customer Form (Right) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Col: Cart Items Summary */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    Selected Items ({totalItems})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500">
                    Calculated in Indian Rupees (₹)
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                        <Image
                          src={item.imageUrl || '/images/default-dairy.jpg'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">
                          {item.productName}
                        </h4>
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 mt-0.5">
                          {item.packSize}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatINR(item.unitPrice)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="w-16 text-right font-black text-sm text-slate-900">
                          {formatINR(item.unitPrice * item.quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Total display */}
                <div className="pt-6 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">{formatINR(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>Estimated Delivery / Counter Pickup:</span>
                    <span className="font-semibold text-emerald-600">Free / Standard Rate</span>
                  </div>
                  <div className="flex justify-between items-center text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-dashed border-slate-200">
                    <span>Estimated Total:</span>
                    <span className="text-xl sm:text-2xl text-sky-700">{formatINR(totalAmount)}</span>
                  </div>
                </div>

                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-xs text-sky-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Guaranteed Fresh Batch:
                  </p>
                  <p>
                    All curd and milk products are prepared fresh daily. Submitting your order reserves your stock immediately.
                  </p>
                </div>
              </div>

              {/* Right Col: Customer Order Information Form */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">
                    Customer Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your details to generate your pre-filled WhatsApp order message and delivery route.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      {t('cart.fullName', 'Your Full Name')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      {t('cart.phone', '10-Digit Mobile Number')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Delivery / Address with Live GPS Detection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {t('cart.address', 'Delivery Address or Shop Pickup')} <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                            <span>{t('cart.gpsDetecting', 'Detecting GPS...')}</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3.5 h-3.5 text-sky-600" />
                            <span>📍 {t('cart.detectGps', 'Use My Live GPS Location')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {locationStatus && (
                      <div className="mb-2 p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-xs flex items-center justify-between gap-2">
                        <span className="text-sky-800 font-medium">{locationStatus}</span>
                        {gpsLocation && (
                          <a
                            href={gpsLocation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:underline"
                          >
                            <span>View Map Pin</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <textarea
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. House #12, Market Street, Gopuvanipalem (or click 'Use My Live GPS Location')"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Special Notes / Function Orders */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Special Instructions / Function Note (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Required for marriage function on Saturday morning, please keep chilled buckets ready."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Ordering Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || items.length === 0}
                      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Calculating Route &amp; Generating Order...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5 fill-white" />
                          <span>{t('cart.checkoutBtn', 'Generate Order & WhatsApp Route')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
