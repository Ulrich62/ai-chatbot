import { useCallback } from 'react';
import { useAuth } from './use-auth';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

export function useApi() {
  const { refreshAuth } = useAuth();

  const apiCall = useCallback(async (
    url: string, 
    options: ApiOptions = {}
  ): Promise<Response> => {
    const {
      method = 'GET',
      headers = {},
      body,
      credentials = 'include'
    } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials,
    };

    if (body && method !== 'GET') {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let response = await fetch(url, config);

    // Si on reçoit une erreur 401, tenter un refresh automatique
    if (response.status === 401) {
      const refreshSuccess = await refreshAuth();
      if (refreshSuccess) {
        // Réessayer la requête originale
        response = await fetch(url, config);
      } else {
        console.warn('[USE_API] Échec du refresh, redirection vers login');
        window.location.href = '/login';
        throw new Error('Session expirée');
      }
    }

    return response;
  }, [refreshAuth]);

  const get = useCallback((url: string, options?: Omit<ApiOptions, 'method'>) => {
    return apiCall(url, { ...options, method: 'GET' });
  }, [apiCall]);

  const post = useCallback((url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return apiCall(url, { ...options, method: 'POST', body });
  }, [apiCall]);

  const put = useCallback((url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return apiCall(url, { ...options, method: 'PUT', body });
  }, [apiCall]);

  const del = useCallback((url: string, options?: Omit<ApiOptions, 'method'>) => {
    return apiCall(url, { ...options, method: 'DELETE' });
  }, [apiCall]);

  const patch = useCallback((url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return apiCall(url, { ...options, method: 'PATCH', body });
  }, [apiCall]);

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
    patch,
  };
} 