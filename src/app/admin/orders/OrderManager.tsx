'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageCircle,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Filter,
  Navigation,
  ExternalLink,
  Send,
  X,
  Map,
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/utils';
import {
  generateWhatsAppLink,
  generateDeliveryRouteUrl,
  generateDeliveryBoyDispatchMessage,
  SHOP_ORIGIN_ADDRESS,
} from '@/lib/whatsapp';

export interface OrderItemType {
  id: string;
  productName: string;
  packSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string | null;
  totalAmount: number;
  status: string;
  isFunctionOrder: boolean;
  createdAt: string | Date;
  items: OrderItemType[];
}

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Delivered',
  'Cancelled',
];

export default function OrderManager({
  initialOrders,
  shopName,
}: {
  initialOrders: OrderRecord[];
  shopName: string;
}) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [functionOnly, setFunctionOnly] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeRouteOrder, setActiveRouteOrder] = useState<OrderRecord | null>(null);

  // Status update handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      const data = await res.json();
      setOrders(orders.map((o) => (o.id === orderId ? data.order : o)));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchFunction = !functionOnly || o.isFunctionOrder;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.address.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q);

    return matchStatus && matchFunction && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Orders &amp; Delivery Routes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track daily milk orders, view live customer order locations, and dispatch turn-by-turn routes to delivery boys from Vani Milk Center.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, phone, address, order ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({orders.length})
            </button>
            {STATUS_OPTIONS.map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === status
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={functionOnly}
              onChange={(e) => setFunctionOnly(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Functions Only</span>
          </label>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-base">No orders found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const customerWhatsAppMsg = `Hello ${order.customerName},\nThis is ${shopName} regarding your dairy order #${order.id.slice(-6).toUpperCase()} (Total: ${formatINR(order.totalAmount)}).\nStatus: *${order.status}*.\nThank you!`;
            const customerWhatsAppLink = generateWhatsAppLink(
              order.customerPhone,
              customerWhatsAppMsg
            );

            // Compute turn-by-turn route from Vani Milk Center (Gopuvanipalem) to customer address
            const routeUrl = generateDeliveryRouteUrl(order.address);

            // Dispatch text for delivery boy
            const deliveryPortalUrl =
              typeof window !== 'undefined'
                ? `${window.location.origin}/delivery/${order.id}`
                : `/delivery/${order.id}`;

            const deliveryBoyDispatchMsg = generateDeliveryBoyDispatchMessage({
              orderId: order.id,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              address: order.address,
              totalAmount: order.totalAmount,
              items: order.items,
              deliveryRouteUrl: routeUrl,
              deliveryPortalUrl,
              notes: order.notes,
            });
            const deliveryBoyWhatsAppLink = `https://wa.me/?text=${encodeURIComponent(
              deliveryBoyDispatchMsg
            )}`;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header: Ref, Customer, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>

                    {order.isFunctionOrder && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                        <span>★ Function Order</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Status Dropdown & WhatsApp Customer */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Status:
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                          order.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : order.status === 'Confirmed'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : order.status === 'Preparing'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : order.status === 'Ready'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : order.status === 'Delivered'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : 'bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <a
                      href={customerWhatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>WhatsApp Customer</span>
                    </a>
                  </div>
                </div>

                {/* Customer Details, Delivery Boy Route Actions & Items Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Customer info & Delivery Boy Navigation */}
                  <div className="lg:col-span-5 space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Customer
                      </span>
                      <p className="font-extrabold text-sm text-slate-900">
                        {order.customerName}
                      </p>
                    </div>

                    <p className="text-slate-600 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${order.customerPhone}`} className="hover:text-sky-600 font-semibold">
                        {order.customerPhone}
                      </a>
                    </p>

                    <div className="text-slate-700 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-semibold block">{order.address}</span>
                      </div>
                    </div>

                    {/* Delivery Boy Route & Navigation Action Bar */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[11px]">
                          <Navigation className="w-3.5 h-3.5 text-sky-600" />
                          <span>Delivery Boy Route from Shop:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveRouteOrder(order)}
                          className="text-[11px] font-bold text-sky-600 hover:text-sky-800 underline cursor-pointer"
                        >
                          Preview Map
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Start turn-by-turn route */}
                        <a
                          href={routeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Start Route</span>
                        </a>

                        {/* Dispatch to delivery boy via WhatsApp */}
                        <a
                          href={deliveryBoyWhatsAppLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors shadow-2xs"
                          title="Share delivery details & route with delivery rider on WhatsApp"
                        >
                          <Send className="w-3 h-3 text-sky-400" />
                          <span>Send Rider</span>
                        </a>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="pt-2 border-t border-slate-200/80">
                        <p className="font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Special Note / Instructions:</span>
                        </p>
                        <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200">
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Products Ordered */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 text-left">Product</th>
                            <th className="py-2 px-3 text-left">Pack Size</th>
                            <th className="py-2 px-3 text-center">Qty</th>
                            <th className="py-2 px-3 text-right">Price</th>
                            <th className="py-2 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2.5 px-3 font-bold text-slate-800">
                                {item.productName}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-semibold">
                                  {item.packSize}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                                {item.quantity}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600">
                                {formatINR(item.unitPrice)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-slate-900">
                                {formatINR(item.totalPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-500">Order Grand Total:</span>
                      <span className="font-black text-lg text-sky-700">
                        {formatINR(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delivery Route Modal Preview */}
      {activeRouteOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveRouteOrder(null);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-black text-base">
                    Delivery Navigation Route
                  </h3>
                  <p className="text-xs text-slate-300">
                    Order #{activeRouteOrder.id.slice(-6).toUpperCase()} • {activeRouteOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveRouteOrder(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Start (Shop Counter)
                  </span>
                  <p className="font-bold text-slate-800">Vani Milk Center</p>
                  <p className="text-slate-500 text-[11px]">{SHOP_ORIGIN_ADDRESS}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Destination (Customer)
                  </span>
                  <p className="font-bold text-slate-800">{activeRouteOrder.customerName}</p>
                  <p className="text-slate-500 text-[11px] truncate">{activeRouteOrder.address}</p>
                </div>
              </div>

              {/* Embedded Interactive Route Map */}
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <iframe
                  title="Delivery Navigation Route"
                  src={`https://maps.google.com/maps?saddr=659J%2BCX2+Vani+milk,+Gopuvanipalem,+Andhra+Pradesh+521002&daddr=${encodeURIComponent(
                    activeRouteOrder.address
                  )}&output=embed`}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <a
                  href={generateDeliveryRouteUrl(activeRouteOrder.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open in Google Maps Navigation</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveRouteOrder(null)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
