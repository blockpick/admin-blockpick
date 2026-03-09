/**
 * User management hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';
import type {
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UserFilterParams,
} from '../types/user';
import type { PaginationParams } from '../types/common';

/**
 * Query keys for user-related queries
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: PaginationParams & UserFilterParams) =>
    [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: (id: string) => [...userKeys.detail(id), 'stats'] as const,
};

/**
 * Hook to get paginated users
 */
export function useUsers(params?: PaginationParams & UserFilterParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    // 검색어가 있을 때는 이전 데이터를 표시하지 않음 (검색 결과가 즉시 반영되도록)
    placeholderData: params?.search ? undefined : (previousData) => previousData,
    enabled: shouldEnableQuery(),
  });
}

/**
 * Hook to get user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: shouldEnableQueryWith(!!id),
  });
}

/**
 * Hook to get user statistics
 */
export function useUserStats() {
  return useQuery({
    queryKey: [...userKeys.all, 'stats'],
    queryFn: () => userService.getUserStats(),
    enabled: shouldEnableQuery(),
  });
}

/**
 * Hook to create user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateUserRequest) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRoleRequest) =>
      userService.updateUserRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
