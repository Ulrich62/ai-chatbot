import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/config/constants';

/**
 * Route de logout pour Office SSO
 * GET /api/logout?session_id=XXX
 * Appelée par Office lors du logout global
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    if (!sessionId) {
      console.warn('[LOGOUT_API] Session ID manquant');
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
    }

    console.log(`[LOGOUT_API] Logout demandé pour session: ${sessionId}`);
    
    // Ici vous pouvez ajouter une logique de validation du session_id
    // si nécessaire (vérification en base de données, etc.)
    
    // Retourner une réponse de succès à Office
    return NextResponse.json({ 
      success: true, 
      message: 'Session déconnectée avec succès' 
    });

  } catch (error) {
    console.error('[LOGOUT_API] Erreur lors du logout:', error);
    return NextResponse.json({ error: 'Erreur de déconnexion' }, { status: 500 });
  }
}
