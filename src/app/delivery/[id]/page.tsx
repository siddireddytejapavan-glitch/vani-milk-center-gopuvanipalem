'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Navigation,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Send,
  User,
  ShoppingBag,
  Truck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { generateDeliveryRouteUrl } from '@/lib/whatsapp';
import { haversineDistanceKm, calculateDeliveryCharge, FREE_DELIVERY_KM, RATE_PER_KM } from '@/lib/delivery';

export default function DeliverySubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || '';

  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryPersonName, setDeliveryPersonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completionData, setCompletionData] = useState<{
    ownerWhatsAppUrl: string;
    ownerNotificationMessage: string;
  } | null>(null);

  // Delivery boy live GPS tracking
  const [boyLocation, setBoyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isTrackingGPS, setIsTrackingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Computed distance from delivery boy's current location → customer location
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null);
  const [liveDeliveryCharge, setLiveDeliveryCharge] = useState<number | null>(null);

  // Live map iframe key — changes when boy location updates to refresh embed
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const mapRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/delivery/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
            if (data.order.status === 'Delivered') {
              setCompletionData({
                ownerWhatsAppUrl: '',
                ownerNotificationMessage: `Order #${orderId.slice(-6).toUpperCase()} is already marked as Delivered.`,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load order info:', err);
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Recalculate live distance to customer whenever boy's position or order customer coords change
  useEffect(() => {
    if (!boyLocation || !order) return;

    // Use customer GPS coords from order if available; otherwise skip
    const customerLat = order.customerLat ?? null;
    const customerLng = order.customerLng ?? null;

    if (customerLat !== null && customerLng !== null) {
      const dist = haversineDistanceKm(boyLocation.lat, boyLocation.lng, customerLat, customerLng);
      setLiveDistanceKm(dist);
      setLiveDeliveryCharge(calculateDeliveryCharge(dist));
    }
  }, [boyLocation, order]);

  const lastSyncTimeRef = useRef<number>(0);
  const syncLocationToServer = async (lat: number, lng: number) => {
    const now = Date.now();
    // throttle to every 3 seconds to avoid unnecessary requests
    if (now - lastSyncTimeRef.current < 3000) return;
    lastSyncTimeRef.current = now;

    try {
      await fetch(`/api/delivery/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryLat: lat,
          deliveryLng: lng,
          status: 'Out for Delivery',
        }),
      });
    } catch (err) {
      console.warn('Failed to sync live delivery GPS to server:', err);
    }
  };

  const startGPSTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by this browser.');
      return;
    }
    setIsTrackingGPS(true);
    setGpsError(null);

    // Initial immediate location fetch
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setBoyLocation({ lat, lng });
        setMapRefreshKey((k) => k + 1);
        syncLocationToServer(lat, lng);
      },
      (err) => console.warn('Initial GPS fetch error:', err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setBoyLocation({ lat, lng });
        // Refresh the live map embed every location update (throttle with key)
        setMapRefreshKey((k) => k + 1);
        syncLocationToServer(lat, lng);
      },
      (err) => {
        setGpsError('GPS error: ' + (err.message || 'Unknown error'));
        setIsTrackingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 4000 }
    );
  };

  const stopGPSTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (mapRefreshTimerRef.current) {
      clearInterval(mapRefreshTimerRef.current);
    }
    setIsTrackingGPS(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (mapRefreshTimerRef.current) {
        clearInterval(mapRefreshTimerRef.current);
      }
    };
  }, []);

  const handleMarkDelivered = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/delivery/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          deliveryNotes: deliveryNotes.trim() || undefined,
          deliveryPersonName: deliveryPersonName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit delivery');
      }

      setCompletionData({
        ownerWhatsAppUrl: data.ownerWhatsAppUrl,
        ownerNotificationMessage: data.ownerNotificationMessage,
      });

      if (order) {
        setOrder({ ...order, status: 'Delivered' });
      }

      // Automatically launch WhatsApp to notify shop owner
      if (data.ownerWhatsAppUrl) {
        window.open(data.ownerWhatsAppUrl, '_blank');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting delivery. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const destinationAddress = order?.address || 'Gopuvanipalem';
  const customerLat = order?.customerLat ?? null;
  const customerLng = order?.customerLng ?? null;
  const shopLat = order?.shopLat ?? 16.4307;
  const shopLng = order?.shopLng ?? 81.1167;

  // Route: from delivery boy's current location (or shop) to customer
  const routeUrl = boyLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${boyLocation.lat},${boyLocation.lng}&destination=${customerLat !== null ? `${customerLat},${customerLng}` : encodeURIComponent(destinationAddress)}`
    : generateDeliveryRouteUrl(destinationAddress, customerLat, customerLng);

  const customerPhoneClean = order?.customerPhone?.replace(/\D/g, '') || '';

  // Shop→Customer distance at order time
  const orderDistanceKm =
    order?.deliveryCharge !== undefined && order?.customerLat !== null
      ? haversineDistanceKm(shopLat, shopLng, order.customerLat ?? shopLat, order.customerLng ?? shopLng)
      : null;
  const orderDeliveryCharge = order?.deliveryCharge ?? null;

  // Live embed map URL — shows delivery boy's current position
  const liveMapEmbedUrl = boyLocation
    ? `https://maps.google.com/maps?q=${boyLocation.lat},${boyLocation.lng}&z=15&output=embed`
    : customerLat !== null
    ? `https://maps.google.com/maps?q=${customerLat},${customerLng}&z=14&output=embed`
    : `https://maps.google.com/maps?q=${shopLat},${shopLng}&z=14&output=embed`;

  // WhatsApp share: send delivery boy live location to customer
  const shareMyLocationUrl = boyLocation
    ? (() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const trackUrl = origin ? `${origin}/track/${orderId}` : '';
        const msg = `🛵 *Vani Milk Center – Delivery Update*\n\nYour order is on the way!\n📍 *Delivery Boy Live Location:* https://maps.google.com/?q=${boyLocation.lat},${boyLocation.lng}\n\n${liveDistanceKm !== null ? `📏 Remaining distance: ${liveDistanceKm.toFixed(2)} km\n` : ''}${trackUrl ? `\n🔍 *Live Order & Map Tracking:* ${trackUrl}\n` : ''}\n*Track your delivery in real time!*`;
        return `https://wa.me/${customerPhoneClean}?text=${encodeURIComponent(msg)}`;
      })()
    : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/90 backdrop-blur-md p-5 rounded-3xl border border-slate-700 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/60">
                Delivery Boy Portal
              </span>
              <h1 className="text-lg font-black text-white mt-0.5">
                Vani Milk Center
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Store</span>
          </Link>
        </div>

        {/* Live GPS Tracking Panel */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isTrackingGPS && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              <span className="text-sm font-bold text-white">
                {isTrackingGPS ? '📡 Live GPS Tracking Active' : '📍 Delivery Boy GPS'}
              </span>
            </div>
            {isTrackingGPS ? (
              <button
                onClick={stopGPSTracking}
                className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Stop Tracking
              </button>
            ) : (
              <button
                onClick={startGPSTracking}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Start My GPS
              </button>
            )}
          </div>

          {gpsError && (
            <p className="text-xs text-rose-400 font-medium">{gpsError}</p>
          )}

          {boyLocation ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-700/60 rounded-xl p-3 text-xs">
                  <span className="text-slate-400 block mb-0.5">My Location (Delivery Boy)</span>
                  <a
                    href={`https://maps.google.com/?q=${boyLocation.lat},${boyLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sky-400 hover:underline font-bold"
                  >
                    {boyLocation.lat.toFixed(5)}, {boyLocation.lng.toFixed(5)}
                  </a>
                </div>
                {customerLat !== null && (
                  <div className="flex-1 bg-slate-700/60 rounded-xl p-3 text-xs">
                    <span className="text-slate-400 block mb-0.5">Customer GPS Pin</span>
                    <a
                      href={`https://maps.google.com/?q=${customerLat},${customerLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-emerald-400 hover:underline font-bold"
                    >
                      {customerLat.toFixed(5)}, {customerLng?.toFixed(5)}
                    </a>
                  </div>
                )}
              </div>

              {/* Live Distance from Delivery Boy to Customer */}
              {liveDistanceKm !== null && (
                <div className={`rounded-xl p-3 text-xs flex items-center justify-between border ${liveDeliveryCharge === 0 ? 'bg-emerald-900/40 border-emerald-700' : 'bg-amber-900/40 border-amber-700'}`}>
                  <div>
                    <span className="text-slate-400 block">Remaining Distance to Customer:</span>
                    <span className="font-black text-white text-base">{liveDistanceKm.toFixed(2)} km</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Order Delivery Charge:</span>
                    <span className={`font-black text-base ${orderDeliveryCharge === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {orderDeliveryCharge !== null
                        ? orderDeliveryCharge === 0 ? '🎁 FREE' : formatINR(orderDeliveryCharge)
                        : '—'}
                    </span>
                  </div>
                </div>
              )}

              {/* Live Embed Map — shows delivery boy's current position */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-600 shadow-inner bg-slate-700">
                <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-sm text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Position
                </div>
                <iframe
                  key={mapRefreshKey}
                  title="Delivery Boy Live Map"
                  src={liveMapEmbedUrl}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              {/* Share Live Location to Customer via WhatsApp */}
              {shareMyLocationUrl && (
                <a
                  href={shareMyLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-600 transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>📡 Share My Live Location to Customer via WhatsApp</span>
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Tap &quot;Start My GPS&quot; to track your live location while on delivery. This helps you navigate to the customer and track distance.
            </p>
          )}
        </div>

        {/* Order Details & Delivery Action Card */}
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Order Reference
              </span>
              <p className="font-mono font-black text-xl text-slate-900">
                #{orderId ? orderId.slice(-6).toUpperCase() : 'PENDING'}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full font-bold text-xs border ${
                order?.status === 'Delivered'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {order?.status === 'Delivered' ? '✅ Delivered' : '🛵 Active Task'}
            </span>
          </div>

          {/* Customer & Destination Summary */}
          {loadingOrder ? (
            <div className="flex items-center justify-center py-6 text-slate-400 text-sm gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
              <span>Loading order information...</span>
            </div>
          ) : (
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {order?.customerName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" /> Customer:
                  </span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                </div>
              )}
              {order?.address && (
                <div className="flex items-start justify-between text-sm">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-rose-500" /> Drop Location:
                  </span>
                  <span className="font-semibold text-slate-800 text-right max-w-[240px]">
                    {order.address}
                  </span>
                </div>
              )}
              {/* Customer GPS Pin */}
              {customerLat !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-500" /> Customer GPS:
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${customerLat},${customerLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-bold text-sky-600 hover:underline"
                  >
                    {Number(customerLat).toFixed(4)}, {Number(customerLng).toFixed(4)}
                  </a>
                </div>
              )}
              {/* Shop Live Location */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Shop Location:
                </span>
                <a
                  href={`https://maps.google.com/?q=${shopLat},${shopLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-bold text-emerald-600 hover:underline"
                >
                  {shopLat.toFixed(4)}, {shopLng.toFixed(4)}
                </a>
              </div>
              {order?.totalAmount !== undefined && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  {/* Delivery charge line */}
                  {orderDeliveryCharge !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-sky-500" /> Delivery Charge:
                      </span>
                      <span className={`font-extrabold text-sm ${orderDeliveryCharge === 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                        {orderDeliveryCharge === 0
                          ? `🎁 FREE${orderDistanceKm !== null ? ` (${orderDistanceKm.toFixed(1)} km)` : ''}`
                          : `${formatINR(orderDeliveryCharge)}${orderDistanceKm !== null ? ` (${orderDistanceKm.toFixed(1)} km)` : ''}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-500" /> Collect Amount:
                    </span>
                    <span className="font-black text-lg text-emerald-700">
                      {formatINR(order.totalAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delivery charge policy note */}
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-700 space-y-1">
            <p className="font-bold">📦 Delivery Charge Policy:</p>
            <p>✓ Within {FREE_DELIVERY_KM} km of shop → FREE delivery</p>
            <p>✓ Longer than {FREE_DELIVERY_KM} km → ₹10 per 15 km slab (or part thereof)</p>
          </div>

          {/* Quick Action Navigation, Call & Live Tracking */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={routeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Route on Map</span>
            </a>
            {customerPhoneClean ? (
              <a
                href={`tel:${customerPhoneClean}`}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Call Customer</span>
              </a>
            ) : (
              <a
                href="tel:7995597719"
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Shop Owner</span>
              </a>
            )}
          </div>

          <Link
            href={`/track/${orderId}`}
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-extrabold text-xs border border-slate-700 transition-colors"
          >
            <Truck className="w-4 h-4 text-sky-400" />
            <span>Open Customer Live Tracking Page (/track/{orderId?.slice(-6)?.toUpperCase()})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submission Done Screen */}
          {completionData ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-900">
                  Delivery Submitted in Platform!
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Order status is updated to <strong>Delivered</strong>. Owner WhatsApp message is ready.
                </p>
              </div>

              {/* Message preview */}
              {completionData.ownerNotificationMessage && (
                <div className="text-left bg-white p-4 rounded-xl border border-emerald-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {completionData.ownerNotificationMessage}
                </div>
              )}

              {completionData.ownerWhatsAppUrl ? (
                <a
                  href={completionData.ownerWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Send Confirmation to Owner on WhatsApp</span>
                </a>
              ) : null}
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleMarkDelivered} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Delivery Boy / Rider Name (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryPersonName}
                  onChange={(e) => setDeliveryPersonName(e.target.value)}
                  placeholder="e.g. Raju (Delivery)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Delivery Note / Cash Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Handed to customer at front door, cash collected."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Delivery...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Mark Delivered &amp; Notify Owner on WhatsApp</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                * When clicked, this updates the order status to Delivered and opens WhatsApp to send instant confirmation to shop owner.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
