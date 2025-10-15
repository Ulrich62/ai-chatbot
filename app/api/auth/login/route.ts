import { type NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/config/constants';

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
      pass: password,
      app: 'ia-assistant',
      type: 'jwt'
    };

    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiRes.ok) {
      console.warn(`[LOGIN] Authentication failed for ${email}: ${apiRes.status} ${apiRes.statusText}`);
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const data = await apiRes.json();
    const { accessToken, refreshToken } = data;

    if (!accessToken) {
      console.error('[LOGIN] No access token received from auth service');
      return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
    }

    // Configuration des cookies
    const response = NextResponse.json({ success: true });
    
    response.cookies.set(AUTH_CONFIG.tokenCookieName, accessToken, {
      httpOnly: AUTH_CONFIG.httpOnly,
      sameSite: AUTH_CONFIG.sameSite,
      secure: AUTH_CONFIG.secure,
      path: '/',
      maxAge: AUTH_CONFIG.tokenMaxAge,
    });

    if (refreshToken) {
      response.cookies.set(AUTH_CONFIG.refreshTokenCookieName, refreshToken, {
        httpOnly: AUTH_CONFIG.httpOnly,
        sameSite: AUTH_CONFIG.sameSite,
        secure: AUTH_CONFIG.secure,
        path: '/',
        maxAge: AUTH_CONFIG.refreshTokenMaxAge,
      });
    }

    return response;

  } catch (err) {
    console.error('[LOGIN] Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
