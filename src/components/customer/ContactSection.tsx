'use client';

import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Clock, Navigation, ExternalLink, Copy, Check } from 'lucide-react';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { generateEnquiryWhatsAppLink } from '@/lib/whatsapp';

export default function ContactSection() {
  const { settings } = useShopSettings();
  const { t } = useLanguage();
  const [copiedPlusCode, setCopiedPlusCode] = useState(false);
  const whatsAppLink = generateEnquiryWhatsAppLink(settings.whatsappNumber);

  const fullLiveAddress = '659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002';
  const plusCode = '659J+CX2';
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002';
  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=659J%2BCX2+Vani+milk%2C+Gopuvanipalem%2C+Andhra+Pradesh+521002';

  const handleCopyPlusCode = () => {
    navigator.clipboard.writeText(plusCode);
    setCopiedPlusCode(true);
    setTimeout(() => setCopiedPlusCode(false), 2000);
  };

  return (
    <section id="contact" className="py-20 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {t('contact.title', 'Visit & Contact Us')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('contact.liveLocation', 'Our Shop Live Location & Timings')}
          </h2>
          <p className="text-slate-600 text-sm">
            {t(
              'contact.subtitle',
              'Visit our counter directly in Gopuvanipalem or contact us for home pickup and marriage function orders.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Address with Plus code */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {t('contact.liveLocation', 'Shop Live Address')}
                    </h4>
                    <span className="text-[11px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                      {plusCode}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Vani milk, Gopuvanipalem
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {fullLiveAddress}
                  </p>
                  <button
                    onClick={handleCopyPlusCode}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 hover:text-sky-900 pt-1 cursor-pointer"
                  >
                    {copiedPlusCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">{t('contact.copied', 'Plus Code Copied!')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('contact.copyCode', 'Copy Plus Code')} ({plusCode})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Timings */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {t('contact.timings', 'Opening Timings')}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {settings.openingHours || 'Daily: 5:00 AM - 10:00 PM'}
                  </p>
                  <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mt-1.5 border border-emerald-200">
                    {t('nav.openHours', 'Open Daily: 5:00 AM – 10:00 PM')}
                  </span>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {t('contact.ownerContact', 'Direct Phone & WhatsApp')}
                  </h4>
                  <p className="text-sm text-slate-700 mt-1 font-semibold">
                    Phone: <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-sky-600">{settings.phone}</a>
                  </p>
                  <p className="text-sm text-slate-700 font-semibold">
                    WhatsApp: <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800">+{settings.whatsappNumber}</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>

              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors active:scale-95"
              >
                <Navigation className="w-4 h-4 text-sky-400" />
                <span>{t('contact.openMaps', 'Directions')}</span>
              </a>
            </div>
          </div>

          {/* Interactive Live Google Maps Card */}
          <div className="lg:col-span-7 bg-white/95 rounded-3xl border border-slate-200/80 shadow-md p-5 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {t('contact.liveLocation', 'Live Shop Map Pin')}
                </span>
                <span className="text-[11px] text-slate-500">
                  • Gopuvanipalem, AP 521002
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
                >
                  <span>{t('contact.openMaps', 'Open Full Map')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Embedded Live Google Map with exact shop location */}
            <div className="relative w-full h-[330px] sm:h-[370px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
              <iframe
                title="Vani Milk Center Live Shop Location"
                src="https://maps.google.com/maps?q=659J%2BCX2+Vani+milk,+Gopuvanipalem,+Andhra+Pradesh+521002&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Live Navigation & Location Details Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-600 text-center sm:text-left">
                <p className="font-extrabold text-slate-900">
                  Vani Milk Center — 659J+CX2 Vani milk
                </p>
                <p className="text-[11px] text-slate-500">
                  Gopuvanipalem, Andhra Pradesh 521002
                </p>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow hover:shadow-md transition-all active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t('contact.openMaps', 'Get Driving Directions')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
