import { NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/config/constants';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_CONFIG.tokenCookieName, '', { 
    path: '/', 
    maxAge: 0,
    httpOnly: AUTH_CONFIG.httpOnly,
    sameSite: AUTH_CONFIG.sameSite,
    secure: AUTH_CONFIG.secure,
  });
  response.cookies.set(AUTH_CONFIG.refreshTokenCookieName, '', { 
    path: '/', 
    maxAge: 0,
    httpOnly: AUTH_CONFIG.httpOnly,
    sameSite: AUTH_CONFIG.sameSite,
    secure: AUTH_CONFIG.secure,
  });
  return response;
} 