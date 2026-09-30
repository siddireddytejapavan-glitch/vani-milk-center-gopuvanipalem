import { PrismaClient } from '@prisma/client';

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''") return false;

  // Verify it is a postgres URL and not an unpopulated placeholder
  const isPostgres = trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://');
  const isSqlite = trimmed.startsWith('file:');
  const hasPlaceholder =
    trimmed.includes('[YOUR-PASSWORD]') ||
    trimmed.includes('[YOUR_PASSWORD]') ||
    trimmed.includes('YOUR_PASSWORD') ||
    trimmed.includes('YOUR-PASSWORD') ||
    trimmed.includes('your_password');

  return (isPostgres || isSqlite) && !hasPlaceholder;
}

export function getDatabaseInfo() {
  const url = process.env.DATABASE_URL || '';
  const isConfigured = isDatabaseConfigured();
  
  let host = 'Not configured';
  let projectRef = 'scgsknoptivsuphzxzoz';
  let isPooler = false;

  try {
    if (url.includes('@')) {
      const parts = url.split('@')[1];
      if (parts) {
        host = parts.split('/')[0] || '';
      }
    }
    if (url.includes('pooler.supabase.com')) {
      isPooler = true;
    }
  } catch (e) {
    // ignore parsing errors
  }

  return {
    provider: 'PostgreSQL (Supabase)',
    isConfigured,
    host,
    projectRef,
    isPooler,
    supabaseDashboardUrl: 'https://supabase.com/dashboard/org/scgsknoptivsuphzxzoz',
  };
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

