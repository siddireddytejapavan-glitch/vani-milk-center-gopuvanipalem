'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Navigation,
  Store,
} from 'lucide-react';

interface SettingsData {
  id: string;
  shopName: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  openingHours: string;
  googleMapsUrl: string;
  logoUrl: string;
  aboutDescription: string;
  bannerText: string;
}

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: SettingsData;
}) {
  const [shopName, setShopName] = useState(initialSettings.shopName || '');
  const [phone, setPhone] = useState(initialSettings.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings.whatsappNumber || ''
  );
  const [address, setAddress] = useState(initialSettings.address || '');
  const [openingHours, setOpeningHours] = useState(
    initialSettings.openingHours || ''
  );
  const [googleMapsUrl, setGoogleMapsUrl] = useState(
    initialSettings.googleMapsUrl || ''
  );
  const [logoUrl, setLogoUrl] = useState(
    initialSettings.logoUrl || '/images/shop-logo.svg'
  );
  const [aboutDescription, setAboutDescription] = useState(
    initialSettings.aboutDescription || ''
  );
  const [bannerText, setBannerText] = useState(
    initialSettings.bannerText || ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload logo');
      }

      setLogoUrl(data.url);
      showNotification('Logo uploaded successfully!');
    } catch (err: any) {
      showNotification(err.message || 'Logo upload failed', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          phone,
          whatsappNumber,
          address,
          openingHours,
          googleMapsUrl,
          logoUrl,
          aboutDescription,
          bannerText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      showNotification('Shop settings updated successfully! Customer site updated.');
    } catch (err: any) {
      showNotification(err.message || 'Error updating settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Shop Information &amp; WhatsApp Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure shop name, contact numbers, address, Google Maps link, and WhatsApp recipient. Changes immediately appear across the entire customer site.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Shop Identity & Contact */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-sky-600" />
            <span>Store Identity &amp; Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Shop Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. VANI MILK CENTER, GOPIVANIPALEM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Public Calling Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="7995597719"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Number (International format) */}
          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-700" />
              <label className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                Shop Owner WhatsApp Number (International format)
              </label>
            </div>
            <p className="text-xs text-emerald-800">
              All customer orders and inquiries are sent to this WhatsApp number. Do not include spaces or &apos;+&apos; (e.g. <span className="font-mono font-bold">917995597719</span> for India).
            </p>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="917995597719"
              className="w-full max-w-sm px-3.5 py-2.5 rounded-xl border border-emerald-300 text-sm font-mono font-bold text-emerald-950 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Shop Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 p-1 flex items-center justify-center">
                <Image
                  src={logoUrl || '/images/shop-logo.svg'}
                  alt="Logo preview"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>

              <div className="space-y-2 flex-1">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/images/shop-logo.svg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Location, Hours & Maps */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>Shop Location &amp; Hours</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Physical Shop Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop No. 4, Main Road, Near Clock Tower, Tuni, Andhra Pradesh"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Opening Hours
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="Morning: 5:30 AM - 1:00 PM | Evening: 4:30 PM - 9:30 PM"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Google Maps Location URL
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: About Story & Announcement Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base">
            About Description &amp; Top Banner
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              About Shop Story (displayed on About page &amp; footer)
            </label>
            <textarea
              rows={3}
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              placeholder="Describe your family dairy history, quality care, and function supplies..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Top Announcement Banner Text
            </label>
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="Fresh Farm Milk & Rich Curd Available Daily | Special Function Bulk Orders Undertaken"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
