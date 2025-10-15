import { AUTH_CONFIG, ERROR_MESSAGES } from '@/config/constants';
import type { AuthTokens, LoginRequest, LoginResponse, User } from '@/types';

/**
 * Centralized authentication utilities
 */
export class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get token from cookies
   * Note: This method won't work with httpOnly cookies
   */
  getToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    // If using httpOnly cookies, we can't access them from client-side
    if (AUTH_CONFIG.httpOnly) {
      console.warn('[AuthService] getToken called but cookies are httpOnly. Use server-side authentication check.');
      return null;
    }
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${AUTH_CONFIG.tokenCookieName}=`)
    );
    
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  /**
   * Get refresh token from cookies
   * Note: This method won't work with httpOnly cookies
   */
  getRefreshToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    // If using httpOnly cookies, we can't access them from client-side
    if (AUTH_CONFIG.httpOnly) {
      console.warn('[AuthService] getRefreshToken called but cookies are httpOnly. Use server-side authentication check.');
      return null;
    }
    
    const cookies = document.cookie.split(';');
    const refreshTokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${AUTH_CONFIG.refreshTokenCookieName}=`)
    );
    
    return refreshTokenCookie ? refreshTokenCookie.split('=')[1] : null;
  }

  /**
   * Set authentication tokens in cookies
   * Note: This method is deprecated for httpOnly cookies. 
   * Tokens should be set server-side via API responses.
   */
  setTokens(tokens: AuthTokens): void {
    if (typeof document === 'undefined') return;

    // Since we're using httpOnly cookies, we can't set them from client-side
    // This method is kept for backward compatibility but should not be used
    console.warn('[AuthService] setTokens called on client-side. Tokens should be set server-side.');
    
    // For non-httpOnly cookies (development only), we can still set them
    if (!AUTH_CONFIG.httpOnly) {
      const cookieOptions = [
        `path=/`,
        `max-age=${AUTH_CONFIG.tokenMaxAge}`,
        `samesite=${AUTH_CONFIG.sameSite}`,
      ];

      if (AUTH_CONFIG.secure) {
        cookieOptions.push('secure');
      }

      document.cookie = `${AUTH_CONFIG.tokenCookieName}=${tokens.access_token}; ${cookieOptions.join('; ')}`;
      
      if (tokens.refresh_token) {
        document.cookie = `${AUTH_CONFIG.refreshTokenCookieName}=${tokens.refresh_token}; ${cookieOptions.join('; ')}`;
      }
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    if (typeof document === 'undefined') return;

    document.cookie = `${AUTH_CONFIG.tokenCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${AUTH_CONFIG.refreshTokenCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  /**
   * Check if user is authenticated
   * Note: With httpOnly cookies, this method is not reliable on client-side
   */
  isAuthenticated(): boolean {
    // With httpOnly cookies, we can't reliably check authentication from client-side
    // This should be handled by the server-side middleware
    if (AUTH_CONFIG.httpOnly) {
      console.warn('[AuthService] isAuthenticated called but cookies are httpOnly. Use server-side authentication check.');
      return false; // Always return false to force server-side check
    }
    return !!this.getToken();
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || ERROR_MESSAGES.AUTH_ERROR);
      }

      const data = await response.json();
      
      // With httpOnly cookies, tokens are set server-side
      // No need to call setTokens() as cookies are handled by the server
      if (AUTH_CONFIG.httpOnly) {
        console.log('[AuthService] Login successful, cookies set server-side');
      } else if (data.tokens) {
        this.setTokens(data.tokens);
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    try {
      // With httpOnly cookies, we can't check refresh token from client-side
      // Just make the request and let the server handle it
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        // Si le refresh échoue, rediriger vers login
        console.warn('[AuthService] Token refresh failed, redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return false;
      }

      const data = await response.json();
      
      // With httpOnly cookies, tokens are set server-side
      // No need to call setTokens() as cookies are handled by the server
      if (AUTH_CONFIG.httpOnly) {
        console.log('[AuthService] Token refresh successful, cookies set server-side');
      } else if (data.tokens) {
        this.setTokens(data.tokens);
      }

      return true;
    } catch (error) {
      console.error('[AuthService] Token refresh error:', error);
      // En cas d'erreur, rediriger vers login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // With httpOnly cookies, we can't check refresh token from client-side
          // The server-side middleware should handle token refresh automatically
          console.warn('[AuthService] Unauthorized response, server should handle token refresh');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('[AuthService] Get current user error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
