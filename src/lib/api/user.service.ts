/**
 * User Management API Service
 * Based on OpenAPI spec: /admin/users/*
 */

import { apiClient } from './client';
import type {
  User,
  UserModel,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  UpdateUserRoleRequest,
  UserRoleInfo,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilterParams,
} from '../types/user';

export interface AdminGetUsersResponse {
  success: boolean;
  code: string;
  message: string;
  data: User[];
  count: number;
}

export interface AdminGetUserResponse {
  success: boolean;
  code: string;
  message: string;
  data: User;
}

export interface AdminCreateUserResponse {
  success: boolean;
  code: string;
  message: string;
  data: User;
}

export interface AdminUpdateUserResponse {
  success: boolean;
  code: string;
  message: string;
  data: User;
}

export interface UpdateUserRoleResponse {
  success: boolean;
  code: string;
  message: string;
  user: UserRoleInfo;
}

export const userService = {
  /**
   * Get all users
   * GET /admin/users
   */
  getUsers: async (): Promise<AdminGetUsersResponse> => {
    return apiClient.get<AdminGetUsersResponse>('/admin/users');
  },

  /**
   * Get user by ID
   * GET /admin/users/{id}
   */
  getUserById: async (id: string): Promise<AdminGetUserResponse> => {
    return apiClient.get<AdminGetUserResponse>(`/admin/users/${id}`);
  },

  /**
   * Create new user
   * POST /admin/users
   */
  createUser: async (data: AdminCreateUserRequest): Promise<AdminCreateUserResponse> => {
    return apiClient.post<AdminCreateUserResponse>('/admin/users', data);
  },

  /**
   * Update user
   * PUT /admin/users/{id}
   */
  updateUser: async (
    id: string,
    data: AdminUpdateUserRequest
  ): Promise<AdminUpdateUserResponse> => {
    return apiClient.put<AdminUpdateUserResponse>(`/admin/users/${id}`, data);
  },

  /**
   * Delete user
   * DELETE /admin/users/{id}
   */
  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/admin/users/${id}`);
  },

  /**
   * Update user role
   * PATCH /admin/users/role
   */
  updateUserRole: async (data: UpdateUserRoleRequest): Promise<UpdateUserRoleResponse> => {
    return apiClient.patch<UpdateUserRoleResponse>('/admin/users/role', data);
  },
};
