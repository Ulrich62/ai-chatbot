import { NextRequest, NextResponse } from 'next/server';
import { SSOOfficeService } from '@/lib/sso-office';
import { AUTH_CONFIG } from '@/config/constants';
import jwt from 'jsonwebtoken';

/**
 * Validation du token SSO Office
 * POST /api/auth/sso/validate
 * Gère les redirections POST d'Office avec auth_token ou not_connected
 */
export async function POST(request: NextRequest) {
  try {
    // Parser les données x-www-form-urlencoded
    const formData = await request.formData();
    const authToken = formData.get('auth_token') as string;
    const notConnected = formData.get('not_connected') as string;
    
    console.log('[SSO_VALIDATE] Paramètres reçus:', { authToken: !!authToken, notConnected: !!notConnected });

    if (authToken) {
      // État 1: Session Office connectée - auth_token reçu
      console.log('[SSO_VALIDATE] Token reçu, validation en cours...');
      
      // Générer un sessionId unique
      const sessionId = `sso_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Valider le token avec Office
      const userData = await SSOOfficeService.validateAuthToken(authToken, sessionId);
      
      if (!userData) {
        console.warn('[SSO_VALIDATE] Token invalide');
        return NextResponse.redirect(new URL('/login?error=invalid_token', request.url), 307);
      }

      // Créer un JWT pour la session locale
      const userJWT = jwt.sign(
        {
          email: userData.email,
          user_id: userData.email, // Utiliser l'email comme ID
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 jours
        },
        process.env.JWT_SECRET || 'fallback-secret'
      );
      
      // Rediriger vers l'app avec les cookies (code 307 pour préserver POST)
      const response = NextResponse.redirect(new URL('/', request.url), 307);
      
      // Cookie principal avec JWT
      response.cookies.set(AUTH_CONFIG.tokenCookieName, userJWT, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 jours
      });

      // Cookie SSO pour logout global
      response.cookies.set('sso_session_id', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 jours
      });

      console.log(`[SSO_VALIDATE] Utilisateur authentifié: ${userData.email}`);
      return response;

    } else if (notConnected) {
      // État 2: Session Office non connectée - rediriger vers login personnalisé
      console.log('[SSO_VALIDATE] Session Office non connectée, redirection vers login');
      return NextResponse.redirect(new URL('/login?not_connected=1', request.url), 307);
    } else {
      // État 3: Aucun paramètre valide
      console.warn('[SSO_VALIDATE] Aucun paramètre valide reçu');
      return NextResponse.redirect(new URL('/login?error=invalid_request', request.url), 307);
    }

  } catch (error) {
    console.error('[SSO_VALIDATE] Erreur:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url), 307);
  }
}

