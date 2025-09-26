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
   */
  getToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${AUTH_CONFIG.tokenCookieName}=`)
    );
    
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  /**
   * Get refresh token from cookies
   */
  getRefreshToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const refreshTokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${AUTH_CONFIG.refreshTokenCookieName}=`)
    );
    
    return refreshTokenCookie ? refreshTokenCookie.split('=')[1] : null;
  }

  /**
   * Set authentication tokens in cookies
   */
  setTokens(tokens: AuthTokens): void {
    if (typeof document === 'undefined') return;

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
   */
  isAuthenticated(): boolean {
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
      
      if (data.tokens) {
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
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.tokens) {
        this.setTokens(data.tokens);
      }

      return true;
    } catch (error) {
      console.error('[AuthService] Token refresh error:', error);
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
          // Try to refresh token
          const refreshSuccess = await this.refreshToken();
          if (refreshSuccess) {
            // Retry getting user
            const retryResponse = await fetch('/api/auth', {
              credentials: 'include',
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return data.user;
            }
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
