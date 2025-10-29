import jwt from 'jsonwebtoken';

/**
 * Vérifie si un token JWT est expiré
 * @param token - Token JWT à vérifier
 * @returns true si le token est expiré, false sinon
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded || !decoded.exp) {
      return true; // Token invalide ou sans expiration
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.warn('[JWT_DECODER] Erreur lors du décodage du token:', error);
    return true; // En cas d'erreur, considérer comme expiré
  }
}

/**
 * Décode un token JWT et retourne les données
 * @param token - Token JWT à décoder
 * @returns Données décodées ou null si invalide
 */
export function decodeToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.decode(token) as jwt.JwtPayload;
  } catch (error) {
    console.warn('[JWT_DECODER] Erreur lors du décodage:', error);
    return null;
  }
}
