import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  [key: string]: any;
  exp?: number;
  iat?: number;
}

/**
 * Decodes a JWT token without verification
 * @param token - The JWT token string to decode
 * @returns An object containing the decoded header and payload, or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const payload = jwtDecode(token);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token string to check
 * @returns true if the token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      return true; // Consider invalid tokens as expired
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true; // Consider invalid tokens as expired
  }
}

/**
 * Gets the expiration time of a JWT token
 * @param token - The JWT token string
 * @returns The expiration time in milliseconds, or null if invalid
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      return null;
    }
    
    // exp is in seconds, convert to milliseconds
    return payload.exp * 1000;
  } catch (error) {
    return null;
  }
}