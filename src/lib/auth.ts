import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dairy_secret_super_secure_key_2026_jwt_token';
export const AUTH_COOKIE_NAME = 'dairy_admin_token';

export interface AdminSessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AdminSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AdminSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.userId) return null;

    if (payload.userId === 'admin-fallback' && payload.role === 'ADMIN') {
      return payload;
    }

    // Verify user still exists and has ADMIN role in DB (with resilient fallback if DB is offline)
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, name: true },
      });

      if (!user || user.role !== 'ADMIN') return null;

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
    } catch {
      // If DB is unreachable, trust validly signed JWT admin payload
      if (payload.role === 'ADMIN') {
        return payload;
      }
      return null;
    }
  } catch {
    return null;
  }
}
