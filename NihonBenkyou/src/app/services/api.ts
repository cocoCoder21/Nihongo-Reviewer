import type { ApiError } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '/nihonbenkyou/api').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${clean}`;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = apiUrl(endpoint);

    const config: RequestInit = {
      credentials: 'include', // Send httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete (config.headers as Record<string, string>)['Content-Type'];
    }

    const response = await fetch(url, config);

    if (response.status === 401) {
      // Try token refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request
        const retryResponse = await fetch(url, config);
        if (!retryResponse.ok) {
          throw await this.parseError(retryResponse);
        }
        return retryResponse.json();
      }
      // Refresh failed — redirect to login
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw { message: 'Session expired', status: 401 } as ApiError;
    }

    if (!response.ok) {
      throw await this.parseError(response);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private async parseError(response: Response): Promise<ApiError> {
    try {
      const body = await response.json();
      return {
        message: body.message || 'An error occurred',
        status: response.status,
        errors: body.errors,
      };
    } catch {
      return {
        message: response.statusText || 'An error occurred',
        status: response.status,
      };
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(apiUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
