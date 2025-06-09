import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, pass } = await req.json();
    
    // Validation des entrées
    if (!email || !pass) {
      console.warn('[LOGIN] Missing email or password');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const payload = {
      email,
      pass,
      app: 'ia-assistant',
      type: 'jwt',
    };

    console.log('[LOGIN] Attempting authentication for:', email);

    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiRes.ok) {
      console.warn(`[LOGIN] Authentication failed for ${email}: ${apiRes.status} ${apiRes.statusText}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const data = await apiRes.json();
    
    // Normalisation des données (gérer le cas où l'API retourne une string)
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    const { accessToken, refreshToken } = parsed;

    if (!accessToken) {
      console.error('[LOGIN] No access token received from auth service');
      return NextResponse.json({ error: 'Authentication service error' }, { status: 500 });
    }

    // Configuration des cookies
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    if (refreshToken) {
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 jours
      });
    }

    console.log(`[LOGIN] Success for ${email}`);
    return response;

  } catch (err) {
    console.error('[LOGIN] Unexpected error:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}