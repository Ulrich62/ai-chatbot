import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { API_CONFIG, ERROR_MESSAGES } from '@/config/constants';
import type { ApiResponse } from '@/types';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
  timeout?: number;
}

interface UseApiReturn {
  apiCall: <T = unknown>(url: string, options?: ApiOptions) => Promise<ApiResponse<T>>;
  get: <T = unknown>(url: string, options?: Omit<ApiOptions, 'method'>) => Promise<ApiResponse<T>>;
  post: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
  put: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
  delete: <T = unknown>(url: string, options?: Omit<ApiOptions, 'method'>) => Promise<ApiResponse<T>>;
  patch: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => Promise<ApiResponse<T>>;
}

export function useApi(): UseApiReturn {
  const { refreshAuth } = useAuth();

  const apiCall = useCallback(async <T = unknown>(
    url: string, 
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      method = 'GET',
      headers = {},
      body,
      credentials = 'include',
      timeout = API_CONFIG.timeout
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

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      config.signal = controller.signal;

      let response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle 401 errors with token refresh
      if (response.status === 401) {
        const refreshSuccess = await refreshAuth();
        if (refreshSuccess) {
          // Retry the original request
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
          
          config.signal = retryController.signal;
          response = await fetch(url, config);
          clearTimeout(retryTimeoutId);
        } else {
          console.warn('[USE_API] Token refresh failed, redirecting to login');
          window.location.href = '/login';
          return {
            success: false,
            error: ERROR_MESSAGES.SESSION_EXPIRED,
          };
        }
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || ERROR_MESSAGES.SERVER_ERROR,
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('[USE_API] Request error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
        };
      }

      return {
        success: false,
        error: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }
  }, [refreshAuth]);

  const get = useCallback(<T = unknown>(url: string, options?: Omit<ApiOptions, 'method'>) => {
    return apiCall<T>(url, { ...options, method: 'GET' });
  }, [apiCall]);

  const post = useCallback(<T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return apiCall<T>(url, { ...options, method: 'POST', body });
  }, [apiCall]);

  const put = useCallback(<T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return apiCall<T>(url, { ...options, method: 'PUT', body });
  }, [apiCall]);

  const del = useCallback(<T = unknown>(url: string, options?: Omit<ApiOptions, 'method'>) => {
    return apiCall<T>(url, { ...options, method: 'DELETE' });
  }, [apiCall]);

  const patch = useCallback(<T = unknown>(url: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return apiCall<T>(url, { ...options, method: 'PATCH', body });
  }, [apiCall]);

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
    patch
  };
}