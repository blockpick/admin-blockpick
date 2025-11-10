/**
 * User management hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';
import type {
  CreateUserRequest,
  UpdateUserRequest,
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
    placeholderData: (previousData) => previousData,
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
export function useUserStats(id: string) {
  return useQuery({
    queryKey: userKeys.stats(id),
    queryFn: () => userService.getUserStats(id),
    enabled: shouldEnableQueryWith(!!id),
  });
}

/**
 * Hook to create user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
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
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
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
 * Hook to suspend user
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      userService.suspendUser(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to activate user
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to export users
 */
export function useExportUsers() {
  return useMutation({
    mutationFn: (params?: UserFilterParams) => userService.exportUsers(params),
  });
}
