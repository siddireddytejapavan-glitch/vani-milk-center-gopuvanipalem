import { PrismaClient } from '@prisma/client';

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''") return false;

  // In production (e.g. Vercel), provider is PostgreSQL so URL must be postgresql:// or postgres://
  if (process.env.NODE_ENV === 'production') {
    return trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://');
  }

  return (
    trimmed.startsWith('postgresql://') ||
    trimmed.startsWith('postgres://') ||
    trimmed.startsWith('file:')
  );
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
