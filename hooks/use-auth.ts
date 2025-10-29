import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/auth';
import type { User } from '@/types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
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
      // With httpOnly cookies, we need to make a server-side request
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Force a refetch of user data after successful refresh
        refetch();
        return true;
      } else {
        console.warn('[USE_AUTH] Token refresh failed');
        return false;
      }
    } catch (error) {
      console.error('[USE_AUTH] Token refresh error:', error);
      return false;
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
    logout,
    refreshAuth,
    isAuthenticated: !!user,
    refetch,
  };
}