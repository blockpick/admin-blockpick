/**
 * Game Management API Service
 * Based on OpenAPI spec: /admin/games/*
 */

import { apiClient } from './client';
import type {
  GameDto,
  CreateGameInput,
  UpdateGameInput,
  GameFilterParams,
  GameStats,
  GameType,
  GameStatusType,
} from '../types/game';
import type { PageResponse, PaginationParams } from '../types/common';

export const gameService = {
  /**
   * Get paginated list of games
   * GET /admin/games
   */
  getGames: async (
    params?: PaginationParams & {
      sortBy?: string;
      sortDirection?: 'ASC' | 'DESC';
    }
  ): Promise<PageResponse<GameDto>> => {
    return apiClient.get<PageResponse<GameDto>>('/admin/games', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get game by ID
   * GET /admin/games/{id}
   */
  getGameById: async (id: string): Promise<GameDto> => {
    return apiClient.get<GameDto>(`/admin/games/${id}`);
  },

  /**
   * Update game
   * PUT /admin/games
   */
  updateGame: async (data: UpdateGameInput): Promise<GameDto> => {
    return apiClient.put<GameDto>('/admin/games', data);
  },

  /**
   * Force end game
   * PUT /admin/games/{id}/force-end
   */
  forceEndGame: async (id: string): Promise<GameDto> => {
    return apiClient.put<GameDto>(`/admin/games/${id}/force-end`);
  },

  /**
   * Get games by type
   * GET /admin/games/type/{type}
   */
  getGamesByType: async (
    type: GameType,
    params?: PaginationParams
  ): Promise<PageResponse<GameDto>> => {
    return apiClient.get<PageResponse<GameDto>>(`/admin/games/type/${type}`, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get games by status
   * GET /admin/games/status/{status}
   */
  getGamesByStatus: async (
    status: GameStatusType,
    params?: PaginationParams
  ): Promise<PageResponse<GameDto>> => {
    return apiClient.get<PageResponse<GameDto>>(`/admin/games/status/${status}`, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get game statistics
   * GET /admin/games/stats
   */
  getGameStats: async (): Promise<GameStats> => {
    return apiClient.get<GameStats>('/admin/games/stats');
  },

  /**
   * Search games by title
   * GET /admin/games/search
   */
  searchGames: async (
    title: string,
    params?: PaginationParams
  ): Promise<PageResponse<GameDto>> => {
    return apiClient.get<PageResponse<GameDto>>('/admin/games/search', {
      params: {
        ...params,
        title,
      } as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get recommended games
   * GET /admin/games/recommended
   */
  getRecommendedGames: async (
    params?: PaginationParams
  ): Promise<PageResponse<GameDto>> => {
    return apiClient.get<PageResponse<GameDto>>('/admin/games/recommended', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get games by date range
   * GET /admin/games/date-range
   */
  getGamesByDateRange: async (
    startDate: string,
    endDate: string,
    params?: PaginationParams
  ): Promise<PageResponse<GameDto>> => {
    return apiClient.get<PageResponse<GameDto>>('/admin/games/date-range', {
      params: {
        ...params,
        startDate,
        endDate,
      } as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Delete game
   * DELETE /admin/games/{id}
   */
  deleteGame: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/admin/games/${id}`);
  },

  /**
   * Get game leaderboard
   * GET /admin/games/{id}/leaderboard
   */
  getGameLeaderboard: async (
    id: string,
    params?: PaginationParams
  ): Promise<PageResponse<{
    userId: string;
    userEmail: string;
    userNickname?: string;
    rank: number;
    score?: number;
    entryCount: number;
    [key: string]: unknown;
  }>> => {
    return apiClient.get<PageResponse<{
      userId: string;
      userEmail: string;
      userNickname?: string;
      rank: number;
      score?: number;
      entryCount: number;
      [key: string]: unknown;
    }>>(`/admin/games/${id}/leaderboard`, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },
};
