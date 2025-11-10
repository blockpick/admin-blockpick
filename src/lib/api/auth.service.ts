/**
 * Authentication API Service
 */

import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RefreshTokenRequest, User } from '../types/auth';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (request: RefreshTokenRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/auth/refresh', request);
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/api/auth/logout');
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/api/auth/me');
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    return apiClient.post<void>('/api/auth/change-password', data);
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    return apiClient.post<void>('/api/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<void> => {
    return apiClient.post<void>('/api/auth/reset-password', data);
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<void> => {
    return apiClient.post<void>('/api/auth/verify-email', { token });
  },
};
