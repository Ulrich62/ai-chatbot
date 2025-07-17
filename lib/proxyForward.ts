import { type NextRequest, NextResponse } from 'next/server';
import { isTokenExpired } from '@/utils/jwt-decoder';

export async function proxyForward(req: NextRequest, targetUrl: string) {
  try {
    let token = req.cookies.get('token')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;

    // Si le token est expiré et qu'on a un refresh token, tenter un refresh
    if (token && refreshToken && isTokenExpired(token)) {
      try {
        const refreshResponse = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
          method: 'POST',
          headers: { 
            'Cookie': req.headers.get('cookie') || '',
            'Content-Type': 'application/json'
          },
        });
        
        if (refreshResponse.ok) {
          // Récupérer le nouveau token depuis les cookies de la réponse
          const newCookies = refreshResponse.headers.getSetCookie();
          const newTokenCookie = newCookies.find(cookie => cookie.startsWith('token='));
          
          if (newTokenCookie) {
            // Extraire la valeur du nouveau token
            const tokenValue = newTokenCookie.split(';')[0].split('=')[1];
            token = tokenValue;
          }
        } else {
          console.warn('[PROXY] Échec du refresh, utilisation du token expiré');
        }
      } catch (error) {
        console.error('[PROXY] Erreur lors du refresh:', error);
      }
    }

    const headers = new Headers(req.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Supprimer les headers qui ne doivent pas être forwardés
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');
    
    let body: BodyInit | undefined = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.text();
    }

    // Ajout des query params de la requête entrante à l'URL cible
    const url = new URL(req.url);
    const search = url.search; // inclut ?page=...&limit=... si présents
    const fullTargetUrl = targetUrl + search;

    // Check if this is an SSE request and handle it differently
    const acceptHeader = req.headers.get('accept');
    if (acceptHeader?.includes('text/event-stream')) {
      // For SSE requests, return the fetch response directly without intercepting
      return fetch(fullTargetUrl, {
        method: req.method,
        headers,
        body,
        redirect: 'manual',
      });
    }

    const backendRes = await fetch(fullTargetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    // Si on reçoit une erreur 401 et qu'on a un refresh token, tenter un refresh
    if (backendRes.status === 401 && refreshToken && token) {
      try {
        const refreshResponse = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
          method: 'POST',
          headers: { 
            'Cookie': req.headers.get('cookie') || '',
            'Content-Type': 'application/json'
          },
        });
        
        if (refreshResponse.ok) {
          // Récupérer le nouveau token
          const newCookies = refreshResponse.headers.getSetCookie();
          const newTokenCookie = newCookies.find(cookie => cookie.startsWith('token='));
          
          if (newTokenCookie) {
            const tokenValue = newTokenCookie.split(';')[0].split('=')[1];
            
            // Mettre à jour les headers avec le nouveau token
            headers.set('Authorization', `Bearer ${tokenValue}`);
            
            // Réessayer la requête avec le nouveau token
            const retryRes = await fetch(fullTargetUrl, {
              method: req.method,
              headers,
              body,
              redirect: 'manual',
            });
            
            // Forwarder le body et les headers de la nouvelle réponse
            const resBody = await retryRes.text();
            const response = new NextResponse(resBody, {
              status: retryRes.status,
            });
            
            // Ajouter les nouveaux cookies à la réponse
            newCookies.forEach(cookie => {
              response.headers.append('Set-Cookie', cookie);
            });
            
            // Forwarder les headers importants
            retryRes.headers.forEach((value, key) => {
              if (key === 'content-type') {
                response.headers.set(key, value);
              }
            });
            
            return response;
          }
        }
      } catch (error) {
        console.error('[PROXY] Erreur lors du refresh après 401:', error);
      }
    }

    // Forwarder le body tel quel (json ou texte)
    const resBody = await backendRes.text();
    const response = new NextResponse(resBody, {
      status: backendRes.status,
    });
    
    // Forwarder les headers importants
    backendRes.headers.forEach((value, key) => {
      if (key === 'content-type') {
        response.headers.set(key, value);
      }
    });
    
    return response;
  } catch (error) {
    console.error('[PROXY] Unexpected error in proxyForward:', error);
    throw error;
  }
}
