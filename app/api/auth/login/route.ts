import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Validation des entrées
    if (!email || !password) {
      console.warn('[LOGIN] Missing email or password');
      return NextResponse.json({ error: 'Email et mot de passe sont requis' }, { status: 400 });
    }

    const payload = {
      email,
      password
    };



    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_RAG_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiRes.ok) {
      console.warn(`[LOGIN] Authentication failed for ${email}: ${apiRes.status} ${apiRes.statusText}`);
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const data = await apiRes.json();
    const { access_token, refresh_token } = data;

    if (!access_token) {
      console.error('[LOGIN] No access token received from auth service');
      return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
    }

    // Configuration des cookies
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    if (refresh_token) {
      response.cookies.set('refreshToken', refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 jours
      });
    }

    return response;

  } catch (err) {
    console.error('[LOGIN] Unexpected error:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}