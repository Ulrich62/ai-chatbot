import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');
  const isLoginPage = req.nextUrl.pathname.startsWith('/login');
  const isApi = req.nextUrl.pathname.startsWith('/api');
  const isStatic = req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname === '/favicon.ico';

  if (!token && !isLoginPage && !isApi && !isStatic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|images|login).*)'],
}; 