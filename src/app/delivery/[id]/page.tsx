'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { generateDeliveryRouteUrl } from '@/lib/whatsapp';

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
  const routeUrl = generateDeliveryRouteUrl(destinationAddress);
  const customerPhoneClean = order?.customerPhone?.replace(/\D/g, '') || '';

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
              {order?.totalAmount !== undefined && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-500" /> Collect Amount:
                  </span>
                  <span className="font-black text-lg text-emerald-700">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Action Navigation & Call */}
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
