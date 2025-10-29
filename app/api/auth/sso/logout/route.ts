import { NextRequest, NextResponse } from 'next/server';
import { SSOOfficeService } from '@/lib/sso-office';

/**
 * Logout SSO avec redirection vers Office
 * POST /api/auth/sso/logout
 */
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sso_session_id')?.value;
    
    // Nettoyer les cookies locaux
    const response = NextResponse.json({ success: true });
    
    // Supprimer les cookies de session
    response.cookies.delete('token');
    response.cookies.delete('sso_session_id');
    
    // Rediriger vers Office pour le logout global
    if (sessionId) {
      const logoutUrl = SSOOfficeService.generateLogoutUrl();
      console.log(`[SSO_LOGOUT] Logout global vers: ${logoutUrl}`);
      return NextResponse.redirect(logoutUrl);
    }
    
    console.log('[SSO_LOGOUT] Logout local effectué');
    return response;

  } catch (error) {
    console.error('[SSO_LOGOUT] Erreur:', error);
    return NextResponse.json({ error: 'Erreur de déconnexion' }, { status: 500 });
  }
}

