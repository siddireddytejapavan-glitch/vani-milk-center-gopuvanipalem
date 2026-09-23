'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { generateWhatsAppLink } from '@/lib/whatsapp';

export default function BulkOrderBanner() {
  const { settings } = useShopSettings();
  const { t } = useLanguage();

  const functionWhatsAppMsg = `Hello, I would like to inquire about bulk dairy products (Curd Buckets / Milk) for an upcoming marriage / family function.`;
  const functionWhatsAppLink = generateWhatsAppLink(
    settings.whatsappNumber,
    functionWhatsAppMsg
  );

  return (
    <section id="functions" className="py-16 bg-gradient-to-r from-sky-900 via-slate-900 to-emerald-950 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Bucket Visual */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-[4/3]">
              <Image
                src="/images/products/curd-bucket.jpg"
                alt="10kg and 20kg curd buckets for marriages and functions"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Function Special
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-white">
                <p className="font-extrabold text-sm">Heavy Duty Food-Grade Buckets</p>
                <p className="text-xs text-slate-300">
                  Easy to transport, hygienic seal, freshly prepared for your event date.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Marriage, Birthday &amp; Catering Specialists</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {t('bulk.title', 'Planning a Marriage or Special Function?')}
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              {t(
                'bulk.desc',
                'We provide large quantities of dairy products for marriages, family functions, birthday parties, religious poojas, hotels, and catering events.'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>5 kg, 10 kg &amp; 20 kg Curd Buckets</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Bulk Fresh Whole Milk (10L - 100L+)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Fresh Paneer Blocks for Curries</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Advance Booking &amp; On-Time Delivery</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/products?category=curd"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm shadow-lg transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('bulk.orderNow', 'Order Curd Buckets Now')}</span>
              </Link>

              <a
                href={functionWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Function Enquiry</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
