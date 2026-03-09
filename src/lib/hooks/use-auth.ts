/**
 * Authentication hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authService } from '../api';
import type { LoginRequest, AdminInfo } from '../types/auth';
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: shouldEnableQuery(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Handle errors
  useEffect(() => {
    if (query.error && typeof window !== 'undefined') {
      console.error('Auth error:', query.error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('dev_mode');
      queryClient.resetQueries({ queryKey: authKeys.currentUser() });
    }
  }, [query.error, queryClient]);

  return query;
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
        localStorage.removeItem('dev_mode');
      }

      // Clear all queries
      queryClient.clear();

      // Reset query client to ensure clean state
      queryClient.resetQueries();
    },
    onError: () => {
      // Even if logout fails, clear everything
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('dev_mode');
      }
      queryClient.clear();
      queryClient.resetQueries();
    },
  });
}

/**
 * Hook to refresh token
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshToken: string) =>
      authService.refreshToken({ refreshToken }),
    onSuccess: (data) => {
      // Store new access token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.accessToken);
      }
      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
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
