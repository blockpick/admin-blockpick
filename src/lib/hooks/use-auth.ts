/**
 * Authentication hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api';
import type { LoginRequest, User } from '../types/auth';
import { shouldEnableQuery } from './query-utils';

/**
 * Query keys for auth-related queries
 */
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
};

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: shouldEnableQuery(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Hook to handle login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
}

/**
 * Hook to handle logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }

      // Clear all queries
      queryClient.clear();
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
  });
}

/**
 * Hook to request password reset
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
  });
}

/**
 * Hook to reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authService.resetPassword(data),
  });
}

/**
 * Hook to get authentication state
 */
export function useAuth() {
  const { data: user, isLoading, error } = useCurrentUser();
  const login = useLogin();
  const logout = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
    login: login.mutate,
    loginAsync: login.mutateAsync,
    isLoggingIn: login.isPending,
    logout: logout.mutate,
    logoutAsync: logout.mutateAsync,
    isLoggingOut: logout.isPending,
  };
}
