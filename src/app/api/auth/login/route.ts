import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (dbErr) {
      console.warn('Database query failed during admin login, falling back to environment check:', (dbErr as any)?.message || dbErr);
    }

    const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'siddreddylakshmankumar@gmail.com').toLowerCase().trim();
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'VANI@MILK';

    const inputEmail = email.toLowerCase().trim();
    let isValid = false;
    let sessionUser = {
      id: 'admin-fallback',
      email: defaultAdminEmail,
      name: 'Lakshman Kumar',
      role: 'ADMIN',
    };

    if (user && user.role === 'ADMIN') {
      isValid = await verifyPassword(password, user.passwordHash);
      if (isValid) {
        sessionUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    } else if (inputEmail === defaultAdminEmail && password === defaultAdminPassword) {
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign session token
    const token = signToken({
      userId: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.role,
      name: sessionUser.name,
    });

    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
