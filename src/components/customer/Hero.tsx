'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { generateEnquiryWhatsAppLink } from '@/lib/whatsapp';

export default function Hero() {
  const { settings } = useShopSettings();
  const whatsAppLink = generateEnquiryWhatsAppLink(settings.whatsappNumber);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white/90 via-sky-50/70 to-white/80 backdrop-blur-[2px] pt-10 pb-16 lg:py-20 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tag badge */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/90 text-sky-800 text-xs font-extrabold tracking-wide uppercase border border-sky-200/60 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>100% Pure &amp; Farm Fresh Dairy</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-black tracking-wide border border-emerald-200/60 shadow-xs">
                <span>⏰ Open: 5:00 AM – 10:00 PM</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Fresh Milk &amp; Dairy Products for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-600">
                Your Family &amp; Functions
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Fresh, quality dairy products available for daily needs, family functions, marriages and special events. Directly from our local family shop to your home.
            </p>

            {/* Bullets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Daily Fresh Milk</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thick Set Curd</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bulk Function Buckets</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/products"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-lg shadow-sky-600/20 hover:shadow-xl transition-all active:scale-95"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Shop Products</span>
              </Link>

              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Small reassurance note */}
            <p className="text-xs text-slate-500 pt-1">
              * Fast response on WhatsApp • Daily Store Timings: 5:00 AM to 10:00 PM
            </p>
          </div>

          {/* Right Image Display - Storefront Photo Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[4/3] max-h-[540px] mx-auto bg-slate-900 group">
                <Image
                  src="/images/vani-storefront.jpg"
                  alt="Vani Milk Center Storefront - Gopivanipalem"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="bg-sky-600/90 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    📍 Our Actual Shop
                  </span>
                  <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Open 5 AM - 10 PM
                  </span>
                </div>

                {/* Floating caption on image */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-sm sm:text-base tracking-wide">
                        VANI MILK CENTER
                      </p>
                      <p className="text-xs text-slate-200">
                        659J+CX2 Gopuvanipalem • WhatsApp / Call: 7995597719
                      </p>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/30">
                      100% Pure
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating micro card */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-lg">
                  10kg
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Curd Buckets for Functions</p>
                  <p className="text-[11px] text-slate-500">5kg, 10kg &amp; 20kg available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
