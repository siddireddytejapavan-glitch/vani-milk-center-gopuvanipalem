import { PrismaClient } from '@prisma/client';

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''") return false;

  // Verify it is a postgres URL and not an unpopulated placeholder
  const isPostgres = trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://');
  const hasPlaceholder =
    trimmed.includes('[YOUR-PASSWORD]') ||
    trimmed.includes('[YOUR_PASSWORD]') ||
    trimmed.includes('YOUR_PASSWORD') ||
    trimmed.includes('YOUR-PASSWORD') ||
    trimmed.includes('your_password');

  return isPostgres && !hasPlaceholder;
}


export function getDatabaseInfo() {
  const url = process.env.DATABASE_URL || '';
  const isConfigured = isDatabaseConfigured();

  let host = 'aws-0-us-west-1.pooler.supabase.com:6543';
  let database = 'postgres';

  try {
    if (url.includes('@')) {
      const parts = url.split('@')[1];
      if (parts) {
        host = parts.split('/')[0] || host;
        const dbPart = parts.split('/')[1];
        if (dbPart) {
          database = dbPart.split('?')[0] || database;
        }
      }
    }
  } catch (e) {
    // ignore parsing errors
  }

  return {
    provider: 'Supabase PostgreSQL',
    isConfigured,
    host,
    database,
  };
}


const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

