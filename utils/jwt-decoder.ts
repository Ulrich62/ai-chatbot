import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  [key: string]: any;
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