/**
 * System Monitoring API Service
 * Based on OpenAPI spec: /admin/monitoring/*
 */

import { apiClient } from './client';
import type {
  SystemHealthStatus,
  TransactionStatus,
  EventStatus,
} from '../types/monitoring';

export const monitoringService = {
  /**
   * Get system health status
   * GET /admin/monitoring/health
   */
  getHealthStatus: async (): Promise<SystemHealthStatus> => {
    return apiClient.get<SystemHealthStatus>('/admin/monitoring/health');
  },

  /**
   * Get transaction status
   * GET /admin/monitoring/transactions
   */
  getTransactionStatus: async (): Promise<TransactionStatus> => {
    return apiClient.get<TransactionStatus>('/admin/monitoring/transactions');
  },

  /**
   * Get event status
   * GET /admin/monitoring/events
   */
  getEventStatus: async (): Promise<EventStatus> => {
    return apiClient.get<EventStatus>('/admin/monitoring/events');
  },

  /**
   * Retry failed event
   * POST /admin/monitoring/events/{eventId}/retry
   */
  retryEvent: async (eventId: string): Promise<void> => {
    return apiClient.post<void>(`/admin/monitoring/events/${eventId}/retry`);
  },

  /**
   * Get system logs
   * GET /admin/monitoring/logs
   */
  getLogs: async (params?: {
    level?: string;
    service?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<{
    content: Array<{
      id: string;
      level: string;
      service: string;
      message: string;
      timestamp: string;
      [key: string]: unknown;
    }>;
    totalElements: number;
    totalPages: number;
  }> => {
    return apiClient.get<{
      content: Array<{
        id: string;
        level: string;
        service: string;
        message: string;
        timestamp: string;
        [key: string]: unknown;
      }>;
      totalElements: number;
      totalPages: number;
    }>('/admin/monitoring/logs', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get performance metrics
   * GET /admin/monitoring/metrics
   */
  getMetrics: async (params?: {
    startDate?: string;
    endDate?: string;
    interval?: string;
  }): Promise<{
    cpu: Array<{ timestamp: string; value: number }>;
    memory: Array<{ timestamp: string; value: number }>;
    requests: Array<{ timestamp: string; count: number }>;
    [key: string]: unknown;
  }> => {
    return apiClient.get<{
      cpu: Array<{ timestamp: string; value: number }>;
      memory: Array<{ timestamp: string; value: number }>;
      requests: Array<{ timestamp: string; count: number }>;
      [key: string]: unknown;
    }>('/admin/monitoring/metrics', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },
};

