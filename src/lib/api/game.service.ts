/**
 * Game Management API Service
 */

import { apiClient } from './client';
import type {
  Game,
  CreateGameRequest,
  UpdateGameRequest,
  GameFilterParams,
  GameStats,
} from '../types/game';
import type { PageResponse, PaginationParams } from '../types/common';

export const gameService = {
  /**
   * Get paginated list of games
   */
  getGames: async (
    params?: PaginationParams & GameFilterParams
  ): Promise<PageResponse<Game>> => {
    return apiClient.get<PageResponse<Game>>('/api/games', {
      params: params as Record<string, string | number | boolean | undefined>
    });
  },

  /**
   * Get game by ID
   */
  getGameById: async (id: string): Promise<Game> => {
    return apiClient.get<Game>(`/api/games/${id}`);
  },

  /**
   * Create new game
   */
  createGame: async (data: CreateGameRequest): Promise<Game> => {
    return apiClient.post<Game>('/api/games', data);
  },

  /**
   * Update game
   */
  updateGame: async (id: string, data: UpdateGameRequest): Promise<Game> => {
    return apiClient.put<Game>(`/api/games/${id}`, data);
  },

  /**
   * Delete game
   */
  deleteGame: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/games/${id}`);
  },

  /**
   * Publish game
   */
  publishGame: async (id: string): Promise<Game> => {
    return apiClient.post<Game>(`/api/games/${id}/publish`);
  },

  /**
   * Archive game
   */
  archiveGame: async (id: string): Promise<Game> => {
    return apiClient.post<Game>(`/api/games/${id}/archive`);
  },

  /**
   * Get game statistics
   */
  getGameStats: async (id: string): Promise<GameStats> => {
    return apiClient.get<GameStats>(`/api/games/${id}/stats`);
  },

  /**
   * Get leaderboard for a game
   */
  getGameLeaderboard: async (
    id: string,
    params?: PaginationParams
  ): Promise<
    PageResponse<{
      userId: string;
      username: string;
      score: number;
      rank: number;
      playedAt: string;
    }>
  > => {
    return apiClient.get(`/api/games/${id}/leaderboard`, {
      params: params as Record<string, string | number | boolean | undefined>
    });
  },

  /**
   * Upload game thumbnail
   */
  uploadThumbnail: async (id: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/games/${id}/thumbnail`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  },
};
