import type { User } from '@/types';

/**
 * Service d'authentification simplifié pour SSO Office
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
   * Logout user via SSO
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
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
          console.warn('[AuthService] Unauthorized response, redirecting to login');
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
