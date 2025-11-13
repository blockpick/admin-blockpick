/**
 * Monitoring hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringService } from '../api';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';

/**
 * Query keys for monitoring-related queries
 */
export const monitoringKeys = {
  all: ['monitoring'] as const,
  health: () => [...monitoringKeys.all, 'health'] as const,
  transactions: () => [...monitoringKeys.all, 'transactions'] as const,
  events: () => [...monitoringKeys.all, 'events'] as const,
  logs: (params?: {
    level?: string;
    service?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => [...monitoringKeys.all, 'logs', params] as const,
  metrics: (params?: {
    startDate?: string;
    endDate?: string;
    interval?: string;
  }) => [...monitoringKeys.all, 'metrics', params] as const,
};

/**
 * Hook to get system health status
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: monitoringKeys.health(),
    queryFn: () => monitoringService.getHealthStatus(),
    enabled: shouldEnableQuery(),
    refetchInterval: 30000, // Refresh every 30 seconds
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
 * Hook to get transaction status
 */
export function useTransactionStatus() {
  return useQuery({
    queryKey: monitoringKeys.transactions(),
    queryFn: () => monitoringService.getTransactionStatus(),
    enabled: shouldEnableQuery(),
    refetchInterval: 30000,
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
 * Hook to get event status
 */
export function useEventStatus() {
  return useQuery({
    queryKey: monitoringKeys.events(),
    queryFn: () => monitoringService.getEventStatus(),
    enabled: shouldEnableQuery(),
    refetchInterval: 30000,
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
 * Hook to get system logs
 */
export function useLogs(params?: {
  level?: string;
  service?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: monitoringKeys.logs(params),
    queryFn: () => monitoringService.getLogs(params),
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
 * Hook to get performance metrics
 */
export function useMetrics(params?: {
  startDate?: string;
  endDate?: string;
  interval?: string;
}) {
  return useQuery({
    queryKey: monitoringKeys.metrics(params),
    queryFn: () => monitoringService.getMetrics(params),
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
 * Hook to retry failed event
 */
export function useRetryEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => monitoringService.retryEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.events() });
    },
  });
}

