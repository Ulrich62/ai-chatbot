import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Rediriger vers le logout SSO
    return NextResponse.redirect(new URL('/api/auth/sso/logout', req.url));

  } catch (err) {
    console.error('[SIGNOUT] Erreur inattendue:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 