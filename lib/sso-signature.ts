import crypto from 'crypto';

/**
 * Service de signature HTTP pour SSO Office
 * Conforme à la spécification Draft Cavage
 */
export class SSOSignatureService {
  private static readonly SECRET = process.env.HTTP_SIGNATURE_SECRET!;
  private static readonly KEY_ID = 'ia-assistant';

  /**
   * Crée une signature HTTP conforme à la spécification Office
   * @param method - Méthode HTTP (GET, POST, etc.)
   * @param url - URL complète de la requête
   * @param sessionId - Session ID pour la requête
   * @returns Headers d'autorisation avec signature
   */
  static createSignature(method: string, url: string, sessionId: string): Record<string, string> {
    const created = Math.floor(Date.now() / 1000);
    const urlObj = new URL(url);
    const requestTarget = `${method.toLowerCase()} ${urlObj.pathname}`;
    
    // Format Backend simplifié: juste les valeurs brutes séparées par newline
    const signingString = `${requestTarget}\n${created}`;
    
    const signature = crypto.createHmac('sha256', this.SECRET).update(signingString).digest('base64');
    
    // Header Authorization au format Draft Cavage
    const authorization = `Signature keyId="${this.KEY_ID}",algorithm="hmac-sha256",created=${created},headers="(request-target) (created)",signature="${signature}"`;
    
    return {
      'Authorization': authorization,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Valide la configuration SSO
   * @returns true si la configuration est valide
   */
  static validateConfig(): boolean {
    if (!this.SECRET) {
      console.error('[SSO_SIGNATURE] HTTP_SIGNATURE_SECRET manquant');
      return false;
    }
    return true;
  }
}

