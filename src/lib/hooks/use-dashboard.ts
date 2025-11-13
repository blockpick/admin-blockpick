/**
 * Dashboard hooks using React Query
 */

import { useQuery } from '@tanstack/react-query';
import { userService } from '../api';
import { gameService } from '../api';
import { productService } from '../api';
import { monitoringService } from '../api';
import { dashboardService } from '../api/dashboard';
import { shouldEnableQuery } from './query-utils';

/**
 * Query keys for dashboard-related queries
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentGames: () => [...dashboardKeys.all, 'recentGames'] as const,
  recentUsers: () => [...dashboardKeys.all, 'recentUsers'] as const,
  systemHealth: () => [...dashboardKeys.all, 'systemHealth'] as const,
  charts: () => [...dashboardKeys.all, 'charts'] as const,
  activities: () => [...dashboardKeys.all, 'activities'] as const,
};

/**
 * Hook to get dashboard statistics
 */
export function useDashboardStats() {
  const usersQuery = useQuery({
    queryKey: [...dashboardKeys.stats(), 'users'],
    queryFn: () => userService.getUsers(),
    enabled: shouldEnableQuery(),
  });

  const gamesQuery = useQuery({
    queryKey: [...dashboardKeys.stats(), 'games'],
    queryFn: () => gameService.getGames({ page: 0, size: 1 }),
    enabled: shouldEnableQuery(),
  });

  const activeGamesQuery = useQuery({
    queryKey: [...dashboardKeys.stats(), 'activeGames'],
    queryFn: () => gameService.getGamesByStatus('ACTIVE', { page: 0, size: 1 }),
    enabled: shouldEnableQuery(),
  });

  const productsQuery = useQuery({
    queryKey: [...dashboardKeys.stats(), 'products'],
    queryFn: () => productService.getProducts({ page: 0, size: 1 }),
    enabled: shouldEnableQuery(),
  });

  const gameStatsQuery = useQuery({
    queryKey: [...dashboardKeys.stats(), 'gameStats'],
    queryFn: () => gameService.getGameStats(),
    enabled: shouldEnableQuery(),
  });

  return {
    users: usersQuery.data?.count || 0,
    totalGames: gamesQuery.data?.totalElements || 0,
    activeGames: activeGamesQuery.data?.totalElements || 0,
    totalProducts: productsQuery.data?.totalElements || 0,
    gameStats: gameStatsQuery.data,
    isLoading: usersQuery.isLoading || gamesQuery.isLoading || productsQuery.isLoading,
    isError: usersQuery.isError || gamesQuery.isError || productsQuery.isError,
  };
}

/**
 * Hook to get recent games
 */
export function useRecentGames(limit: number = 5) {
  return useQuery({
    queryKey: [...dashboardKeys.recentGames(), limit],
    queryFn: () => gameService.getGames({ page: 0, size: limit, sortBy: 'createdAt', sortDirection: 'DESC' }),
    enabled: shouldEnableQuery(),
  });
}

/**
 * Hook to get recent users
 */
export function useRecentUsers(limit: number = 5) {
  return useQuery({
    queryKey: [...dashboardKeys.recentUsers(), limit],
    queryFn: () => userService.getUsers(),
    enabled: shouldEnableQuery(),
    select: (data) => {
      // Sort by createdAt if available, otherwise return first N users
      const users = data?.data || [];
      return users
        .slice(0, limit)
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
    },
  });
}

/**
 * Hook to get system health
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: dashboardKeys.systemHealth(),
    queryFn: () => monitoringService.getHealthStatus(),
    enabled: shouldEnableQuery(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error) => {
      // 500 에러는 서버 문제이므로 재시도하지 않음
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to get chart data
 */
export function useChartData(
  type: 'users' | 'games' | 'revenue' | 'products',
  params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }
) {
  return useQuery({
    queryKey: [...dashboardKeys.charts(), type, params],
    queryFn: () => dashboardService.getChartData(type, params),
    enabled: shouldEnableQuery(),
    retry: (failureCount, error) => {
      // 500 에러는 서버 문제이므로 재시도하지 않음
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to get recent activities
 */
export function useRecentActivities(limit: number = 20) {
  return useQuery({
    queryKey: [...dashboardKeys.activities(), limit],
    queryFn: () => dashboardService.getRecentActivities({ limit }),
    enabled: shouldEnableQuery(),
    retry: (failureCount, error) => {
      // 500 에러는 서버 문제이므로 재시도하지 않음
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

