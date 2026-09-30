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
  
  if (url.startsWith('file:')) {
    return {
      provider: 'Project Database (SQLite)',
      isConfigured,
      host: 'Local Project File (prisma/dev.db)',
      database: 'vani_milk_center',
    };
  }

  let host = 'localhost:5432';
  let database = 'vani_milk_center';

  try {
    if (url.includes('@')) {
      const parts = url.split('@')[1];
      if (parts) {
        host = parts.split('/')[0] || 'localhost:5432';
        const dbPart = parts.split('/')[1];
        if (dbPart) {
          database = dbPart.split('?')[0] || 'vani_milk_center';
        }
      }
    }
  } catch (e) {
    // ignore parsing errors
  }

  return {
    provider: 'PostgreSQL',
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

