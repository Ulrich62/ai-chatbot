import { type NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/config/constants';
import jwt from 'jsonwebtoken';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;
  
  const token = req.cookies.get(AUTH_CONFIG.tokenCookieName)?.value;
  const isLoginPage = pathname.startsWith('/login');
  const isApi = pathname.startsWith('/api');
  const isStatic = pathname.startsWith('/_next') || pathname === '/favicon.ico';
  const isPWAFile = pathname === '/manifest.json' || pathname === '/sw.js';
  const isSSORoute = pathname.startsWith('/api/auth/sso');

  // Réécrire les POST /login vers l'endpoint de validation SSO (Office envoie en POST)
  if (pathname === '/login' && method === 'POST') {
    const url = req.nextUrl.clone();
    url.pathname = '/api/auth/sso/validate';
    return NextResponse.rewrite(url);
  }

  // Laisser passer les fichiers PWA sans authentification
  if (isPWAFile) {
    return NextResponse.next();
  }

  // Si c'est une route statique, API ou login, laisser passer
  if (isLoginPage || isApi || isStatic || isSSORoute) {
    return NextResponse.next();
  }

  // Si pas de token, rediriger vers login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Valider le JWT local (SSO)
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return NextResponse.next();
  } catch (jwtError) {
    console.warn('[MIDDLEWARE] JWT validation failed, redirecting to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    // Exclure explicitement les fichiers PWA du matching
    '/((?!api/|_next/|favicon.ico|images/|manifest.json|sw.js).*)',
    // Inclure explicitement /login pour capter les POST d'Office
    '/login',
  ],
}; 