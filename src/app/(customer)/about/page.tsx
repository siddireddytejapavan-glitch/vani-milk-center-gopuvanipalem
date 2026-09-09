import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, CheckCircle2, MessageCircle, HeartHandshake } from 'lucide-react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import FloatingWhatsApp from '@/components/customer/FloatingWhatsApp';
import CartDrawer from '@/components/customer/CartDrawer';
import { getShopSettings } from '@/lib/catalog';
import { generateEnquiryWhatsAppLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await getShopSettings();

  const shopName = settings?.shopName || 'VANI MILK CENTER, GOPIVANIPALEM';
  const whatsappNumber = settings?.whatsappNumber || '917995597719';
  const whatsAppLink = generateEnquiryWhatsAppLink(whatsappNumber);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <CartDrawer />
      <FloatingWhatsApp />

      <main className="flex-1 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-sky-600 bg-sky-100 px-3.5 py-1 rounded-full">
              Our Story &amp; Quality
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              About {shopName}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              We are a local family-owned dairy shop providing fresh and quality milk and dairy products for families, daily customers, and special occasions.
            </p>
          </div>

          {/* Main Visual & Story */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto min-h-[300px]">
              <Image
                src="/images/vani-storefront.jpg"
                alt="Vani Milk Center Storefront - Gopivanipalem"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pure • Fresh • Untouched</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Fresh Dairy Prepared Daily for Local Homes &amp; Events
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {settings?.aboutDescription ||
                  'We are a local family-owned dairy shop providing fresh and quality milk and dairy products for families, daily customers and special occasions.'}
              </p>
              <div className="space-y-2.5 pt-2 text-sm text-slate-700 font-semibold">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Collected fresh twice every morning and evening</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Naturally set thick curd without preservatives</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bulk 5kg, 10kg, 20kg curd buckets for marriages</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Trust Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border border-white/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Family-Run Care</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every batch of milk and curd is handled with personal care and honest weights.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border border-white/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Freshness Guaranteed</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our morning stock opens at 5:00 AM every day so your morning coffee and tea are fresh. Open daily 5:00 AM to 10:00 PM.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border border-white/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">WhatsApp Ease</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct WhatsApp contact with the shop owner for personal attention to every order.
              </p>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="bg-gradient-to-r from-sky-700 to-emerald-700 rounded-3xl p-8 text-center text-white space-y-4">
            <h3 className="text-2xl font-black">Experience Pure Farm-Fresh Dairy</h3>
            <p className="text-sm text-sky-100 max-w-xl mx-auto">
              Place your order online today and chat directly with us on WhatsApp.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/products"
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-sm shadow hover:bg-slate-100 transition-colors"
              >
                Browse Products &amp; Prices
              </Link>
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm shadow transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
