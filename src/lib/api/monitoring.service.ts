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
};

