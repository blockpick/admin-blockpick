/**
 * Authentication API Service
 * Based on OpenAPI spec: /admin/auth/*
 */

import { apiClient } from './client';
import type {
  LoginRequest,
  AdminLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  VerifyTokenResponse,
  AdminInfo,
} from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.blockpick.net';

export const authService = {
  /**
   * Admin login with email and password
   * POST /admin/auth/login
   */
  login: async (credentials: LoginRequest): Promise<AdminLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw errorData;
    }

    return await response.json();
  },

  /**
   * Refresh access token
   * POST /admin/auth/refresh
   */
  refreshToken: async (request: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>('/admin/auth/refresh', request);
  },

  /**
   * Verify token and get admin info
   * POST /admin/auth/verify
   */
  verifyToken: async (): Promise<VerifyTokenResponse> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Token verification failed' }));
      throw errorData;
    }

    return await response.json();
  },

  /**
   * Get current user profile (uses verify endpoint)
   * Legacy method for backward compatibility
   */
  getCurrentUser: async (): Promise<AdminInfo> => {
    const verifyResult = await authService.verifyToken();
    if (!verifyResult.valid || !verifyResult.admin) {
      throw new Error('Invalid token or admin not found');
    }
    return verifyResult.admin;
  },

  /**
   * Logout (client-side only)
   */
  logout: async (): Promise<void> => {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  },
};
