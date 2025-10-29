import { SSOSignatureService } from './sso-signature';
import type { NextRequest } from 'next/server';

/**
 * Service SSO Office pour la gestion de l'authentification
 */
export class SSOOfficeService {
  private static readonly OFFICE_BASE_URL = process.env.OFFICE_BASE_URL!;
  private static readonly APP_NAME = process.env.OFFICE_APP_NAME || 'ia-assistant';

  /**
   * Génère l'URL de login Office
   * @returns URL de redirection vers Office
   */
  static generateLoginUrl(): string {
    return `${this.OFFICE_BASE_URL}/login?app=${this.APP_NAME}`;
  }

  /**
   * Génère l'URL de callback pour les redirections POST d'Office
   * Conformément à la spécification SSO Office
   * 
   * @param request - Requête Next.js pour extraire l'URL dynamiquement
   * @returns URL de callback pour les redirections POST
   */
  static generateCallbackUrl(request: NextRequest): string {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    return `${baseUrl}/api/auth/sso/validate`;
  }

  /**
   * Génère l'URL de logout Office
   * @returns URL de redirection vers Office pour logout
   */
  static generateLogoutUrl(): string {
    return `${this.OFFICE_BASE_URL}/logout?app=${this.APP_NAME}`;
  }

  /**
   * Valide un token d'authentification avec Office
   * @param authToken - Token d'authentification reçu d'Office
   * @param sessionId - ID de session unique
   * @returns Données utilisateur ou null si échec
   */
  static async validateAuthToken(authToken: string, sessionId: string): Promise<{ email: string } | null> {
    try {
      if (!SSOSignatureService.validateConfig()) {
        console.error('[SSO_OFFICE] Configuration de signature invalide');
        return null;
      }

      const url = `${this.OFFICE_BASE_URL}/api/checkAuthToken?auth_token=${authToken}&session_id=${sessionId}`;
      
      const signatureHeaders = SSOSignatureService.createSignature('GET', url, sessionId);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: signatureHeaders
      });

      if (!response.ok) {
        console.warn(`[SSO_OFFICE] Échec de validation: ${response.status} ${response.statusText}`);
        return null;
      }

      const userData = await response.json();
      console.log(`[SSO_OFFICE] Utilisateur authentifié: ${userData.email}`);
      
      return userData;
    } catch (error) {
      console.error('[SSO_OFFICE] Erreur lors de la validation:', error);
      return null;
    }
  }

  /**
   * Valide la configuration SSO
   * @returns true si la configuration est valide
   */
  static validateConfig(): boolean {
    if (!this.OFFICE_BASE_URL) {
      console.error('[SSO_OFFICE] OFFICE_BASE_URL manquant');
      return false;
    }
    
    if (!this.APP_NAME) {
      console.error('[SSO_OFFICE] OFFICE_APP_NAME manquant');
      return false;
    }

    return SSOSignatureService.validateConfig();
  }
}

