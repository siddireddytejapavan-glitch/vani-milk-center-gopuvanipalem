'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';

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
            Customer Orders Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track daily milk orders, curd bucket quantities, function deliveries, and send WhatsApp confirmations.
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
            placeholder="Search by customer, phone, order ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
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

          {/* Function Filter Toggle */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pl-2 border-l border-slate-200">
            <input
              type="checkbox"
              checked={functionOnly}
              onChange={(e) => setFunctionOnly(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600"
            />
            <span>Function Orders Only</span>
          </label>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
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
                  <div className="flex items-center gap-3">
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

                {/* Customer Details & Items Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Customer info */}
                  <div className="lg:col-span-4 space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="font-extrabold text-sm text-slate-900">
                      {order.customerName}
                    </p>
                    <p className="text-slate-600 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${order.customerPhone}`} className="hover:text-sky-600">
                        {order.customerPhone}
                      </a>
                    </p>
                    <p className="text-slate-600 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{order.address}</span>
                    </p>

                    {order.notes && (
                      <div className="pt-2 border-t border-slate-200/80">
                        <p className="font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Special Note / Requirements:</span>
                        </p>
                        <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200">
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Products Ordered */}
                  <div className="lg:col-span-8 flex flex-col justify-between">
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
    </div>
  );
}
