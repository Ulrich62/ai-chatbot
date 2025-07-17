import { useEffect, useState, useCallback } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', { 
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        return true;
      } else {
        console.warn('[USE_AUTH] Échec du refresh');
        return false;
      }
    } catch (error) {
      console.error('[USE_AUTH] Erreur lors du refresh:', error);
      return false;
    }
  }, []);

  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth', { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setError(null);
      } else if (response.status === 401) {
        // Token expiré ou invalide, tenter un refresh
        const refreshSuccess = await refreshAuth();
        if (refreshSuccess) {
          // Réessayer de récupérer les données utilisateur
          const retryResponse = await fetch('/api/auth', { credentials: 'include' });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setUser(data.user);
            setError(null);
          } else {
            setUser(null);
            setError('Utilisateur non authentifié');
          }
        } else {
          setUser(null);
          setError('Session expirée');
        }
      } else {
        setUser(null);
        setError('Erreur d\'authentification');
      }
    } catch (error) {
      console.error('[USE_AUTH] Erreur lors de la récupération des données utilisateur:', error);
      setUser(null);
      setError('Erreur de connexion');
    }
  }, [refreshAuth]);

  useEffect(() => {
    setLoading(true);
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setError(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('[USE_AUTH] Erreur lors de la déconnexion:', error);
    }
  }, []);

  return { 
    user, 
    loading, 
    error, 
    refreshAuth, 
    logout,
    refetch: () => {
      setLoading(true);
      fetchUser().finally(() => setLoading(false));
    }
  };
}
