import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const { data: user, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<User | null> => {
      return await authService.getCurrentUser();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      return await authService.refreshToken();
    } catch (error) {
      console.error('[USE_AUTH] Token refresh error:', error);
      return false;
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        // Invalider le cache pour forcer un refetch
        refetch();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      return { success: false, error: errorMessage };
    }
  }, [refetch]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      // Invalider le cache pour forcer un refetch
      refetch();
      window.location.href = '/login';
    } catch (error) {
      console.error('[USE_AUTH] Logout error:', error);
    }
  }, [refetch]);

  return {
    user: user || null,
    loading,
    error: error?.message || null,
    login,
    logout,
    refreshAuth,
    isAuthenticated: !!user,
    refetch,
  };
}