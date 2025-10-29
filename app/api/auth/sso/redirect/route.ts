import { NextResponse } from 'next/server';
import { SSOOfficeService } from '@/lib/sso-office';

/**
 * Redirection vers Office SSO
 * GET /api/auth/sso/redirect
 */
export async function GET() {
  try {
    if (!SSOOfficeService.validateConfig()) {
      console.error('[SSO_REDIRECT] Configuration SSO invalide');
      return NextResponse.json({ error: 'Configuration SSO invalide' }, { status: 500 });
    }

    const loginUrl = SSOOfficeService.generateLoginUrl();
    console.log(`[SSO_REDIRECT] Redirection vers: ${loginUrl}`);
    
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('[SSO_REDIRECT] Erreur:', error);
    return NextResponse.json({ error: 'Erreur de redirection' }, { status: 500 });
  }
}

