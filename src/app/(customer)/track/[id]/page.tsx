'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Navigation,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Truck,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Store,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import FloatingWhatsApp from '@/components/customer/FloatingWhatsApp';
import { formatINR } from '@/lib/utils';
import {
  haversineDistanceKm,
  getDeliveryInfo,
  calculateDeliveryCharge,
  FREE_DELIVERY_KM,
  CHARGE_SLAB_KM,
  RATE_PER_SLAB,
  SHOP_LAT_DEFAULT,
  SHOP_LNG_DEFAULT,
} from '@/lib/delivery';

export default function CustomerOrderTrackingPage() {
  const params = useParams();
  const orderId = (params?.id as string) || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrder = React.useCallback(async (isManual = false) => {
    if (!orderId) return;
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/delivery/${orderId}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        throw new Error('Order not found or could not be loaded.');
      }
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setLastRefreshed(new Date());
      }
    } catch (err: any) {
      console.error('Failed to load tracking data:', err);
      setError((prev) => prev || err.message || 'Failed to load order tracking.');
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    // Auto-poll every 6 seconds to update delivery boy's live location
    const timer = setInterval(() => {
      fetchOrder();
    }, 6000);
    return () => clearInterval(timer);
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-sky-600 mx-auto" />
            <p className="text-slate-600 font-bold text-sm">
              Connecting to live order &amp; delivery tracking...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Order Not Found</h2>
            <p className="text-xs text-slate-500">
              We couldn&apos;t find an order with reference #{orderId?.slice(-6)?.toUpperCase()}.
              Please verify your order link.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dairy Store</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const shopLat = order.shopLat ?? SHOP_LAT_DEFAULT;
  const shopLng = order.shopLng ?? SHOP_LNG_DEFAULT;
  const customerLat = order.customerLat ?? null;
  const customerLng = order.customerLng ?? null;
  const deliveryLat = order.deliveryLat ?? null;
  const deliveryLng = order.deliveryLng ?? null;
  const status = order.status || 'Pending';

  // Distance calculations
  const orderDistanceKm =
    customerLat !== null && customerLng !== null
      ? haversineDistanceKm(shopLat, shopLng, customerLat, customerLng)
      : null;

  const deliveryInfo =
    orderDistanceKm !== null
      ? getDeliveryInfo(customerLat, customerLng, shopLat, shopLng)
      : null;

  // Remaining distance from delivery boy to customer (if live GPS is broadcasting)
  const remainingDistanceKm =
    deliveryLat !== null && deliveryLng !== null && customerLat !== null && customerLng !== null
      ? haversineDistanceKm(deliveryLat, deliveryLng, customerLat, customerLng)
      : null;

  // Map embed URL
  let mapEmbedUrl: string;
  if (deliveryLat !== null && deliveryLng !== null && customerLat !== null && customerLng !== null) {
    // Show directions from delivery boy to customer
    mapEmbedUrl = `https://maps.google.com/maps?saddr=${deliveryLat},${deliveryLng}&daddr=${customerLat},${customerLng}&output=embed`;
  } else if (customerLat !== null && customerLng !== null) {
    // Show directions from shop to customer
    mapEmbedUrl = `https://maps.google.com/maps?saddr=${shopLat},${shopLng}&daddr=${customerLat},${customerLng}&output=embed`;
  } else {
    // Fallback: shop pin
    mapEmbedUrl = `https://maps.google.com/maps?q=${shopLat},${shopLng}&z=14&output=embed`;
  }

  // Turn-by-turn navigation in Google Maps
  const externalMapUrl =
    deliveryLat !== null && deliveryLng !== null && customerLat !== null && customerLng !== null
      ? `https://www.google.com/maps/dir/?api=1&origin=${deliveryLat},${deliveryLng}&destination=${customerLat},${customerLng}`
      : customerLat !== null && customerLng !== null
      ? `https://www.google.com/maps/dir/?api=1&origin=${shopLat},${shopLng}&destination=${customerLat},${customerLng}`
      : `https://maps.google.com/?q=${shopLat},${shopLng}`;

  const isDelivered = status === 'Delivered';
  const isOutForDelivery = status === 'Out for Delivery' || (deliveryLat !== null && !isDelivered);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <FloatingWhatsApp />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Live Order Tracker
                </span>
                <h1 className="text-xl font-black text-slate-900 mt-0.5">
                  Order #{order.id?.slice(-6)?.toUpperCase()}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchOrder(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Live Status'}</span>
              </button>

              <Link
                href="/products"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Shop More</span>
              </Link>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`p-6 rounded-3xl border shadow-sm ${
            isDelivered
              ? 'bg-emerald-500 text-white border-emerald-600'
              : isOutForDelivery
              ? 'bg-gradient-to-r from-sky-600 to-emerald-600 text-white border-sky-700'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    isDelivered ? 'bg-white' : 'bg-emerald-400 animate-ping'
                  }`} />
                  <span className="text-xs uppercase font-black tracking-wider opacity-90">
                    Current Delivery Status
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {isDelivered
                    ? '🎉 Order Delivered Successfully!'
                    : isOutForDelivery
                    ? '🛵 Delivery Boy is On the Way!'
                    : status === 'Confirmed' || status === 'Preparing'
                    ? '🥣 Preparing Fresh Dairy Batch at Shop'
                    : '📦 Order Received & Reserved'}
                </h2>
                <p className="text-xs sm:text-sm opacity-90">
                  {isDelivered
                    ? 'Thank you for choosing Vani Milk Center. Enjoy your pure dairy products!'
                    : isOutForDelivery
                    ? remainingDistanceKm !== null
                      ? `Delivery boy is approximately ${remainingDistanceKm.toFixed(1)} km away from your location.`
                      : 'Delivery boy has departed from Vani Milk Center and is heading towards your location.'
                    : 'Your pure milk and dairy products are freshly packed at our shop in Gopuvanipalem.'}
                </p>
              </div>

              {deliveryLat !== null && deliveryLng !== null && !isDelivered && (
                <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30 text-center shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">
                    Live GPS Stream
                  </span>
                  <span className="text-lg font-black block mt-0.5">
                    Active 📡
                  </span>
                  <span className="text-[10px] opacity-80 block">
                    Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            {/* Step Progress Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-white/20 text-center text-xs font-bold">
              <div className="p-2.5 rounded-xl bg-white/20 border border-white/30">
                ✓ 1. Placed
              </div>
              <div className={`p-2.5 rounded-xl border ${
                status !== 'Pending' ? 'bg-white/20 border-white/30' : 'bg-black/10 border-white/10 opacity-70'
              }`}>
                {status !== 'Pending' ? '✓' : '●'} 2. Confirmed
              </div>
              <div className={`p-2.5 rounded-xl border ${
                isOutForDelivery || isDelivered ? 'bg-white/20 border-white/30' : 'bg-black/10 border-white/10 opacity-70'
              }`}>
                {isOutForDelivery || isDelivered ? '✓' : '●'} 3. On the Way
              </div>
              <div className={`p-2.5 rounded-xl border ${
                isDelivered ? 'bg-white/20 border-white/30' : 'bg-black/10 border-white/10 opacity-70'
              }`}>
                {isDelivered ? '✓ 4. Delivered' : '4. Delivered'}
              </div>
            </div>
          </div>

          {/* Interactive Live Map */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-black text-slate-900">
                    Live GPS Map — Product &amp; Delivery Route
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time route showing Vani Milk Center shop, delivery boy location, and customer drop point.
                </p>
              </div>

              <a
                href={externalMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Location Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Shop Origin */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  1. Shop Origin
                </span>
                <p className="font-extrabold text-slate-900">Vani Milk Center</p>
                <p className="text-slate-500 text-[11px] mt-0.5">659J+CX2, Gopuvanipalem, AP</p>
                <a
                  href={`https://maps.google.com/?q=${shopLat},${shopLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:underline font-bold mt-1"
                >
                  <Store className="w-3 h-3" />
                  <span>Shop Pin ({shopLat.toFixed(3)}, {shopLng.toFixed(3)})</span>
                </a>
              </div>

              {/* Delivery Boy Live Location */}
              <div className={`p-3.5 rounded-2xl border ${
                deliveryLat !== null ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-1">
                  2. Delivery Boy Live Pin
                </span>
                <p className="font-extrabold text-slate-900">
                  {deliveryLat !== null ? '🛵 Moving on Route' : '⏳ Awaiting Dispatch'}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {deliveryLat !== null
                    ? `${deliveryLat.toFixed(4)}, ${deliveryLng?.toFixed(4)}`
                    : 'Coordinates will stream once delivery boy starts'}
                </p>
                {remainingDistanceKm !== null && (
                  <p className="text-[11px] font-extrabold text-sky-700 mt-1">
                    📏 {remainingDistanceKm.toFixed(1)} km to your doorstep
                  </p>
                )}
              </div>

              {/* Customer Delivery Place */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  3. Customer Ordered Place
                </span>
                <p className="font-extrabold text-slate-900 truncate">{order.customerName}</p>
                <p className="text-slate-600 text-[11px] mt-0.5 truncate">{order.address}</p>
                {customerLat !== null && customerLng !== null && (
                  <a
                    href={`https://maps.google.com/?q=${customerLat},${customerLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-bold mt-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Customer GPS Pin ({customerLat.toFixed(4)}, {customerLng.toFixed(4)})</span>
                  </a>
                )}
              </div>
            </div>

            {/* Embedded Interactive Map */}
            <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
              <iframe
                title="Live Delivery Map"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* Delivery Charge Rule Card (10km free, >10km ₹10 per 15km) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Truck className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Delivery Charge &amp; Distance Calculation
                </h3>
                <p className="text-xs text-slate-500">
                  Rule: Free delivery within 10 km of shop. Beyond 10 km: ₹10 per 15 km slab.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Distance Breakdown
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Shop to Customer Distance:</span>
                  <span className="font-extrabold text-slate-900">
                    {orderDistanceKm !== null ? `${orderDistanceKm.toFixed(1)} km` : 'Standard Distance'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Free Delivery Radius:</span>
                  <span className="font-bold text-emerald-600">First 10.0 km (FREE)</span>
                </div>
                {orderDistanceKm !== null && orderDistanceKm > FREE_DELIVERY_KM && (
                  <div className="flex justify-between text-slate-600">
                    <span>Chargeable Distance:</span>
                    <span className="font-bold text-amber-700">
                      {(orderDistanceKm - FREE_DELIVERY_KM).toFixed(1)} km (at ₹10 per 15 km)
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-800 block uppercase tracking-wider text-[10px]">
                  Bill Summary
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Products Subtotal:</span>
                  <span className="font-bold text-slate-900">
                    {formatINR((order.totalAmount || 0) - (order.deliveryCharge || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge:</span>
                  <span className="font-extrabold text-emerald-700">
                    {(order.deliveryCharge || 0) === 0 ? '🎁 FREE' : formatINR(order.deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-200 font-black text-sm">
                  <span>Total Amount:</span>
                  <span className="text-sky-700 text-base">{formatINR(order.totalAmount || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items List */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-600" />
                <span>Ordered Dairy Products ({order.items.length})</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {order.items.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.productName}</p>
                      <p className="text-xs text-slate-500">
                        {item.packSize} • Qty: {item.quantity} × {formatINR(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatINR(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Shop Support Contact Card */}
          <div className="bg-sky-50 rounded-3xl border border-sky-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-2xs">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">Vani Milk Center, Gopuvanipalem</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Have questions about your milk batch or delivery arrival? Contact the shop directly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="tel:7995597719"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                <span>Call Shop (7995597719)</span>
              </a>

              <a
                href="https://wa.me/917995597719"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp Shop</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
