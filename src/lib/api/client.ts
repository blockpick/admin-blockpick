/**
 * API Client Configuration
 * Base configuration for all API requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.blockpick.net';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

export interface ApiRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base API client with automatic error handling and token management
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authorization token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Build request headers with auth token
   */
  private buildHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();

    if (token) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(endpoint, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const { params, headers: customHeaders, ...restConfig } = config;
    const url = this.buildUrl(endpoint, params);
    const headers = this.buildHeaders(customHeaders);

    try {
      const response = await fetch(url, {
        ...restConfig,
        headers,
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(response.status, response.statusText, errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new Error(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export type for extending
export type { ApiClient };
