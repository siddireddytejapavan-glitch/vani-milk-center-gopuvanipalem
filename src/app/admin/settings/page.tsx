import React from 'react';
import { getShopSettings } from '@/lib/catalog';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getShopSettings();

  return (
    <div className="max-w-4xl mx-auto">
      <SettingsForm initialSettings={settings as any} />
    </div>
  );
}
