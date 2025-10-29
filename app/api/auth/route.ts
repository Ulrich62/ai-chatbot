import { type NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/config/constants';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_CONFIG.tokenCookieName)?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    // Valider le JWT local (SSO)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      return NextResponse.json({ 
        user: { 
          email: decoded.email,
          user_id: decoded.user_id,
          uuid: decoded.user_id, // Compatibilité
          label: decoded.email,
          fname: '',
          name: '',
          id: decoded.user_id,
          role: 'user',
          specialities: [],
          companies: [],
        } 
      });
    } catch (jwtError) {
      console.warn('[AUTH] JWT validation failed:', jwtError);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

  } catch (err) {
    console.error('[AUTH] Erreur inattendue:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 