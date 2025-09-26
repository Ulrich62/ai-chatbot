import { useEffect, useState, useCallback } from 'react';
import { authService } from '@/lib/auth';
import type { User, LoginRequest } from '@/types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
  refetch: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      return await authService.refreshToken();
    } catch (error) {
      console.error('[USE_AUTH] Token refresh error:', error);
      return false;
    }
  }, []);

  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('[USE_AUTH] Fetch user error:', error);
      setUser(null);
      setError('Erreur de connexion');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.user || null);
        return { success: true };
      } else {
        setError(result.error || 'Erreur de connexion');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setError(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('[USE_AUTH] Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshAuth,
    isAuthenticated: !!user,
    refetch,
  };
}