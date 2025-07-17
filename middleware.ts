import { type NextRequest, NextResponse } from 'next/server';
import { isTokenExpired } from '@/utils/jwt-decoder';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;
  const isLoginPage = req.nextUrl.pathname.startsWith('/login');
  const isApi = req.nextUrl.pathname.startsWith('/api');
  const isStatic = req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname === '/favicon.ico';
  const isRefreshRoute = req.nextUrl.pathname === '/api/auth/refresh';

  // Si c'est une route statique, API ou login, laisser passer
  if (isLoginPage || isApi || isStatic) {
    return NextResponse.next();
  }

  // Si pas de token mais refresh token disponible, tenter un refresh
  if (!token && refreshToken && !isRefreshRoute) {
    
    try {
      const refreshResponse = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
        method: 'POST',
        headers: { 
          'Cookie': req.headers.get('cookie') || '',
          'Content-Type': 'application/json'
        },
      });
      
      if (refreshResponse.ok) {
        // Récupérer les nouveaux cookies de la réponse
        const newCookies = refreshResponse.headers.getSetCookie();
        
        // Créer une nouvelle réponse avec les cookies mis à jour
        const response = NextResponse.next();
        newCookies.forEach(cookie => {
          response.headers.append('Set-Cookie', cookie);
        });
        
        return response;
      } else {
        console.warn('[MIDDLEWARE] Échec du refresh, redirection vers login');
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Erreur lors du refresh:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Si token présent, vérifier s'il est expiré
  if (token && refreshToken && !isRefreshRoute) {
    if (isTokenExpired(token)) {
      
      try {
        const refreshResponse = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
          method: 'POST',
          headers: { 
            'Cookie': req.headers.get('cookie') || '',
            'Content-Type': 'application/json'
          },
        });
        
        if (refreshResponse.ok) {
          // Récupérer les nouveaux cookies de la réponse
          const newCookies = refreshResponse.headers.getSetCookie();
          
          // Créer une nouvelle réponse avec les cookies mis à jour
          const response = NextResponse.next();
          newCookies.forEach(cookie => {
            response.headers.append('Set-Cookie', cookie);
          });
          
          return response;
        } else {
          console.warn('[MIDDLEWARE] Échec du refresh du token expiré, redirection vers login');
          return NextResponse.redirect(new URL('/login', req.url));
        }
      } catch (error) {
        console.error('[MIDDLEWARE] Erreur lors du refresh du token expiré:', error);
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }

  // Si pas de token et pas de refresh token, rediriger vers login
  if (!token && !refreshToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|images|login).*)'],
}; 