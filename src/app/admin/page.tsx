import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  Clock,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  TrendingUp,
  Plus,
  Settings,
  ExternalLink,
  Store,
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { DEFAULT_PRODUCTS, DEFAULT_SHOP_SETTINGS, getShopSettings } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let totalProducts = DEFAULT_PRODUCTS.length;
  let activeProducts = DEFAULT_PRODUCTS.filter((p) => p.isActive).length;
  let outOfStockCount = 0;
  let totalOrders = 0;
  let pendingOrders = 0;
  let functionOrders = 0;
  let totalRevenue = 0;
  let recentOrders: any[] = [];
  let isDbConnected = false;

  // Resilient database fetch with comprehensive error handling
  try {
    const [
      dbTotalProducts,
      dbActiveProducts,
      dbVariants,
      dbTotalOrders,
      dbPendingOrders,
      dbFunctionOrders,
      dbRecentOrders,
      revenueAggregate,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.findMany({ select: { stockQuantity: true, isAvailable: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'Pending' } }),
      prisma.order.count({ where: { isFunctionOrder: true } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'Cancelled' } },
      }),
    ]);

    totalProducts = dbTotalProducts;
    activeProducts = dbActiveProducts;
    outOfStockCount = dbVariants.filter((v) => !v.isAvailable || v.stockQuantity <= 0).length;
    totalOrders = dbTotalOrders;
    pendingOrders = dbPendingOrders;
    functionOrders = dbFunctionOrders;
    recentOrders = dbRecentOrders || [];
    totalRevenue = revenueAggregate._sum.totalAmount || 0;
    isDbConnected = true;
  } catch (error) {
    console.warn('Admin dashboard DB metrics query failed, using catalog baseline:', (error as any)?.message || error);
    // Baseline fallback from DEFAULT_PRODUCTS
    const allFallbackVariants = DEFAULT_PRODUCTS.flatMap((p) => p.variants);
    outOfStockCount = allFallbackVariants.filter((v) => !v.isAvailable || v.stockQuantity <= 0).length;
  }

  const settings = await getShopSettings();

  const kpiCards = [
    {
      title: 'Total Products',
      value: totalProducts,
      desc: 'Catalogue items in system',
      icon: Package,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      badge: `${activeProducts} Active`,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      title: 'Active In Store',
      value: activeProducts,
      desc: 'Live and orderable online',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Stock Attention',
      value: outOfStockCount,
      desc: outOfStockCount === 0 ? 'All variants in stock' : 'Variants need replenishment',
      icon: AlertTriangle,
      color: outOfStockCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200',
      badge: outOfStockCount > 0 ? 'Needs Attention' : 'Healthy',
      badgeColor: outOfStockCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Total Volume',
      value: formatINR(totalRevenue),
      desc: `${totalOrders} orders processed`,
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badge: 'Revenue',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      desc: 'Awaiting confirmation & dispatch',
      icon: Clock,
      color: pendingOrders > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200',
      badge: pendingOrders > 0 ? 'Action Needed' : 'Up to Date',
      badgeColor: pendingOrders > 0 ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-700',
    },
    {
      title: 'Function / Bulk Orders',
      value: functionOrders,
      desc: 'Marriages, poojas & catering',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'Bulk Curd / Milk',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
              Live Dairy Operations
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isDbConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isDbConnected ? 'System Online (Database Connected)' : 'System Ready (Resilient Fallback Mode)'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {settings?.shopName || 'VANI MILK CENTER, GOPIVANIPALEM'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Manage dairy products, adjust variant prices and curd buckets, confirm WhatsApp customer orders, and control shop information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Link
            href="/admin/products"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({pendingOrders} Pending)</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            title="Open customer storefront in new tab"
          >
            <Store className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all bg-white flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {c.title}
                  </p>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{c.value}</p>
                <p className="text-xs text-slate-500">{c.desc}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${c.color}`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Quick Actions & Direct Links Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/admin/products"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-sky-700 transition-colors">
              Product &amp; Pricing Manager
            </h4>
            <p className="text-xs text-slate-500 truncate">
              Update milk, curd buckets, ghee &amp; stock
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/orders"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
              Customer Order Hub
            </h4>
            <p className="text-xs text-slate-500 truncate">
              Filter pending orders, marriage bookings &amp; receipts
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/admin/settings"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Settings className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
              Shop Info &amp; WhatsApp Settings
            </h4>
            <p className="text-xs text-slate-500 truncate">
              Phone: {settings?.phone || '7995597719'}, timings &amp; banners
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 4. Recent Customer Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest incoming online cart submissions and WhatsApp orders
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-600 hover:text-sky-800 transition-colors"
          >
            <span>View All Orders ({totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">No Customer Orders Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
              When customers place dairy orders or bulk function requests from your website, they will immediately appear here with full customer details and WhatsApp links.
            </p>
            <div className="mt-5">
              <Link
                href="/products"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors"
              >
                <span>Test Storefront &amp; Place Test Order</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items Summary</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date &amp; Time</th>
                  <th className="px-6 py-3.5 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const customerWhatsAppMsg = `Hello ${order.customerName}, regarding your dairy order #${order.id.slice(-6).toUpperCase()} at ${settings?.shopName}...`;
                  const customerWhatsAppUrl = generateWhatsAppLink(
                    order.customerPhone,
                    customerWhatsAppMsg
                  );

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-800">
                        #{order.id.slice(-6).toUpperCase()}
                        {order.isFunctionOrder && (
                          <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800">
                            Function Order
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customerPhone}</span>
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {order.items && order.items.length > 0
                          ? order.items
                              .map((i: any) => `${i.productName} (${i.packSize} × ${i.quantity})`)
                              .join(', ')
                          : 'No items recorded'}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 text-sm">
                        {formatINR(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : order.status === 'Confirmed'
                              ? 'bg-sky-100 text-sky-800'
                              : order.status === 'Preparing'
                              ? 'bg-indigo-100 text-indigo-800'
                              : order.status === 'Ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={customerWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-colors"
                          title="Message customer on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}