/**
 * Dashboard API Service
 * Based on OpenAPI spec: /admin/dashboard/*
 */

import { apiClient } from './client';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  games: {
    total: number;
    active: number;
    ended: number;
    scheduled: number;
  };
  products: {
    total: number;
    active: number;
    inGames: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
    growth: number;
  };
  [key: string]: unknown;
}

export interface DashboardChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    [key: string]: unknown;
  }>;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   * GET /admin/dashboard/stats
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/admin/dashboard/stats');
  },

  /**
   * Get dashboard chart data
   * GET /admin/dashboard/charts/{type}
   */
  getChartData: async (
    type: 'users' | 'games' | 'revenue' | 'products',
    params?: {
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<DashboardChartData> => {
    return apiClient.get<DashboardChartData>(`/admin/dashboard/charts/${type}`, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get recent activities
   * GET /admin/dashboard/activities
   */
  getRecentActivities: async (params?: {
    limit?: number;
  }): Promise<Array<{
    id: string;
    type: string;
    description: string;
    userId?: string;
    gameId?: string;
    productId?: string;
    timestamp: string;
    [key: string]: unknown;
  }>> => {
    return apiClient.get<Array<{
      id: string;
      type: string;
      description: string;
      userId?: string;
      gameId?: string;
      productId?: string;
      timestamp: string;
      [key: string]: unknown;
    }>>('/admin/dashboard/activities', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },
};


