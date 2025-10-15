import { type NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/config/constants';

export async function GET(req: NextRequest) {
  try {
    // Récupérer le refresh token depuis les cookies
    const refreshToken = req.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
      console.warn('[REFRESH] Refresh token manquant');
      return NextResponse.json({ error: 'Refresh token manquant' }, { status: 401 });
    }



    // Appel à l'API externe avec le refresh token comme Bearer
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_BASE_URL}/refreshToken`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
    });

    if (!apiRes.ok) {
      console.warn(`[REFRESH] Échec du refresh: ${apiRes.status} ${apiRes.statusText}`);
      return NextResponse.json({ error: 'Refresh token invalide' }, { status: 401 });
    }

    const data = await apiRes.json();
    
    // Normalisation des données
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    const { accessToken, refreshToken: newRefreshToken } = parsed;

    if (!accessToken) {
      console.error('[REFRESH] Aucun access token reçu du service d\'auth');
      return NextResponse.json({ error: 'Erreur du service d\'authentification' }, { status: 500 });
    }

    // Configuration des cookies avec les nouveaux tokens
    const response = NextResponse.json({ success: true });
    
    response.cookies.set(AUTH_CONFIG.tokenCookieName, accessToken, {
      httpOnly: AUTH_CONFIG.httpOnly,
      sameSite: AUTH_CONFIG.sameSite,
      secure: AUTH_CONFIG.secure,
      path: '/',
      maxAge: AUTH_CONFIG.tokenMaxAge,
    });

    if (newRefreshToken) {
      response.cookies.set(AUTH_CONFIG.refreshTokenCookieName, newRefreshToken, {
        httpOnly: AUTH_CONFIG.httpOnly,
        sameSite: AUTH_CONFIG.sameSite,
        secure: AUTH_CONFIG.secure,
        path: '/',
        maxAge: AUTH_CONFIG.refreshTokenMaxAge,
      });
    }

    return response;

  } catch (err) {
    console.error('[REFRESH] Erreur inattendue:', {
      message: err instanceof Error ? err.message : 'Erreur inconnue',
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 