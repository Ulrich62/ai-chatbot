import { NextRequest, NextResponse } from 'next/server';
import { SSOOfficeService } from '@/lib/sso-office';

/**
 * Login avec credentials (fallback pour not_connected=1)
 * POST /api/auth/sso/login
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    // Appeler Office pour obtenir un auth_token
    const officeResponse = await fetch(`${process.env.OFFICE_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        pass: password,
        app: process.env.OFFICE_APP_NAME || 'ia-assistant',
        type: 'auth_token'
      })
    });

    if (!officeResponse.ok) {
      console.warn(`[SSO_LOGIN] Échec de login Office: ${officeResponse.status}`);
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const loginData = await officeResponse.json();
    const authToken = loginData.auth_token;

    if (!authToken) {
      console.error('[SSO_LOGIN] Aucun token reçu d\'Office');
      return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 });
    }

    // Rediriger vers Office avec le token
    const redirectUrl = `${process.env.OFFICE_BASE_URL}/login?app=${process.env.OFFICE_APP_NAME || 'ia-assistant'}`;
    
    console.log(`[SSO_LOGIN] Login réussi pour ${email}, redirection vers Office`);
    
    return NextResponse.json({ 
      success: true, 
      redirectUrl,
      message: 'Redirection vers Office...' 
    });

  } catch (error) {
    console.error('[SSO_LOGIN] Erreur:', error);
    return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 });
  }
}

