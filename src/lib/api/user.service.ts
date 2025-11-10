/**
 * User Management API Service
 */

import { apiClient } from './client';
import type {
  UserModel,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilterParams,
} from '../types/user';
import type { PageResponse, PaginationParams } from '../types/common';

export const userService = {
  /**
   * Get paginated list of users
   */
  getUsers: async (
    params?: PaginationParams & UserFilterParams
  ): Promise<PageResponse<UserModel>> => {
    return apiClient.get<PageResponse<UserModel>>('/api/users', {
      params: params as Record<string, string | number | boolean | undefined>
    });
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserModel> => {
    return apiClient.get<UserModel>(`/api/users/${id}`);
  },

  /**
   * Create new user
   */
  createUser: async (data: CreateUserRequest): Promise<UserModel> => {
    return apiClient.post<UserModel>('/api/users', data);
  },

  /**
   * Update user
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<UserModel> => {
    return apiClient.put<UserModel>(`/api/users/${id}`, data);
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/users/${id}`);
  },

  /**
   * Suspend user
   */
  suspendUser: async (id: string, reason?: string): Promise<UserModel> => {
    return apiClient.post<UserModel>(`/api/users/${id}/suspend`, { reason });
  },

  /**
   * Activate user
   */
  activateUser: async (id: string): Promise<UserModel> => {
    return apiClient.post<UserModel>(`/api/users/${id}/activate`);
  },

  /**
   * Get user statistics
   */
  getUserStats: async (id: string): Promise<{
    totalGamesPlayed: number;
    totalPoints: number;
    nftCount: number;
    rank: number;
  }> => {
    return apiClient.get(`/api/users/${id}/stats`);
  },

  /**
   * Export users to CSV
   */
  exportUsers: async (params?: UserFilterParams): Promise<Blob> => {
    const response = await fetch(
      apiClient['buildUrl']('/api/users/export', params as Record<string, string | number | boolean | undefined>),
      {
        headers: apiClient['buildHeaders'](),
      }
    );
    return response.blob();
  },
};
