import { useQuery } from '@tanstack/react-query';

interface UserInfo {
  uuid: string;
  email: string;
  name: string;
  fname: string;
  label: string;
  id: number;
  role: any;
  specialities: any[];
  companies: any[];
}

export function useUserInfo() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-info'],
    queryFn: async (): Promise<UserInfo> => {
      const response = await fetch('/api/auth/user-info', { 
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur');
      }
      
      const data = await response.json();
      return data.user;
    },
    staleTime: Infinity, // Les données ne deviennent jamais "stale"
    gcTime: 24 * 60 * 60 * 1000, // 24 heures en cache
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  return {
    userInfo: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
}