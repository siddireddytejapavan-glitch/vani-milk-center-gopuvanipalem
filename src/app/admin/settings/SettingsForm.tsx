'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useShopSettings } from '@/context/ShopSettingsContext';
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
  Database,
  ShieldCheck,
  Key,
  RefreshCw,
  ExternalLink,
  Layers,
  Server,
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
  const router = useRouter();
  const { refreshSettings } = useShopSettings();

  // Shop Settings State
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

  // Supabase Database Connection State
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoadingDbStatus, setIsLoadingDbStatus] = useState(false);
  const [isSeedingDb, setIsSeedingDb] = useState(false);

  // Admin Account & Security State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Database status and current Admin profile
  const fetchDbStatus = async () => {
    setIsLoadingDbStatus(true);
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      setDbStatus(data);
    } catch (e) {
      console.warn('DB status fetch error:', e);
    } finally {
      setIsLoadingDbStatus(false);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.admin) {
          setAdminName(data.admin.name || '');
          setAdminEmail(data.admin.email || '');
        }
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }
  };

  useEffect(() => {
    fetchDbStatus();
    fetchAdminProfile();
  }, []);

  const handleSyncDatabase = async () => {
    setIsSeedingDb(true);
    try {
      const res = await fetch('/api/database/status', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Database seeding failed');
      }
      showNotification(data.message || 'Database synchronized successfully!');
      fetchDbStatus();
      router.refresh();
    } catch (err: any) {
      showNotification(err.message || 'Database sync failed', 'error');
    } finally {
      setIsSeedingDb(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update admin profile');
      }

      showNotification('Admin credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      showNotification(err.message || 'Error updating credentials', 'error');
    } finally {
      setIsSavingProfile(false);
    }
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

  const handleSaveShopSettings = async (e: React.FormEvent) => {
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
        throw new Error(data.error || 'Failed to save settings');
      }

      showNotification('Store settings saved successfully!');
      refreshSettings();
      router.refresh();
    } catch (err: any) {
      showNotification(err.message || 'Something went wrong', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Shop Operations &amp; Supabase Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your Supabase PostgreSQL cloud database, store information, customer WhatsApp hotline, and admin credentials.
        </p>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-bold transition-all shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* ======================================================================== */}
      {/* 1. SUPABASE POSTGRESQL DATABASE CLOUD HUB */}
      {/* ======================================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/70 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg">Supabase PostgreSQL Database</h3>
                <span
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                    dbStatus?.status === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {dbStatus?.status === 'connected' ? '● Connected' : '○ Ready for Credentials'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Managed PostgreSQL Cloud Engine • Project: <code className="text-sky-300 font-mono">scgsknoptivsuphzxzoz</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDbStatus}
              disabled={isLoadingDbStatus}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDbStatus ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
            <a
              href="https://supabase.com/dashboard/org/scgsknoptivsuphzxzoz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow cursor-pointer"
            >
              <span>Open Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Database Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Categories</span>
            <span className="text-xl font-black text-white">{dbStatus?.counts?.categories ?? '-'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Products</span>
            <span className="text-xl font-black text-white">{dbStatus?.counts?.products ?? '-'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Pack Sizes</span>
            <span className="text-xl font-black text-white">{dbStatus?.counts?.variants ?? '-'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Orders</span>
            <span className="text-xl font-black text-white">{dbStatus?.counts?.orders ?? '-'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Admins</span>
            <span className="text-xl font-black text-white">{dbStatus?.counts?.users ?? '-'}</span>
          </div>
        </div>

        {/* Seeding & Quick Sync Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-700/60">
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>Initial Database Seeding &amp; Table Population</span>
            </p>
            <p className="text-slate-400 text-[11px]">
              Sync all fresh dairy products, curd buckets, ghee, and default settings directly into your Supabase database.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSyncDatabase}
            disabled={isSeedingDb}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSeedingDb ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Database...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Seed / Populate Supabase</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* 2. ADMIN ACCOUNT & SECURITY SETTINGS */}
      {/* ======================================================================== */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5"
      >
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <span>Admin Account &amp; Credentials Security</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify the admin login name, email address, or update your password directly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Admin Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="e.g. Lakshman Kumar Siddireddy"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Admin Email (Username) <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="siddreddylakshmankumar@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              Current Password (required to change password)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter existing password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              New Password (optional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Credentials...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                <span>Update Admin Credentials</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ======================================================================== */}
      {/* 3. STORE DETAILS & WHATSAPP CONFIGURATION */}
      {/* ======================================================================== */}
      <form onSubmit={handleSaveShopSettings} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-sky-600" />
            <span>Store Profile &amp; Contact Hotline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Shop Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="VANI MILK CENTER, GOPUVANIPALEM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Primary Phone Number (Customer calls)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="7995597719"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                WhatsApp Order Dispatch Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="917995597719"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Include country code without + or spaces (e.g. 917995597719)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Store Logo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border border-slate-200 p-1 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                  <Image
                    src={logoUrl || '/images/shop-logo.svg'}
                    alt="Store Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/images/shop-logo.svg"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
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
        </div>

        {/* Location & Opening Hours */}
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
              placeholder="e.g. 659J+CX2 Vani milk, Gopuvanipalem, Andhra Pradesh 521002"
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

        {/* About Story & Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base">
            About Description &amp; Top Announcement Banner
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
              About Shop Story (displayed on About page &amp; footer)
            </label>
            <textarea
              rows={3}
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              placeholder="Describe your dairy history, pure quality milk, curd, and catering orders..."
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
              placeholder="100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Store Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Store Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
