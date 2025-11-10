/**
 * Game management hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gameService } from '../api';
import type {
  CreateGameRequest,
  UpdateGameRequest,
  GameFilterParams,
} from '../types/game';
import type { PaginationParams } from '../types/common';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';

/**
 * Query keys for game-related queries
 */
export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: (params?: PaginationParams & GameFilterParams) =>
    [...gameKeys.lists(), params] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (id: string) => [...gameKeys.details(), id] as const,
  stats: (id: string) => [...gameKeys.detail(id), 'stats'] as const,
  leaderboard: (id: string, params?: PaginationParams) =>
    [...gameKeys.detail(id), 'leaderboard', params] as const,
};

/**
 * Hook to get paginated games
 */
export function useGames(params?: PaginationParams & GameFilterParams) {
  return useQuery({
    queryKey: gameKeys.list(params),
    queryFn: () => gameService.getGames(params),
    placeholderData: (previousData) => previousData,
    enabled: shouldEnableQuery(),
  });
}

/**
 * Hook to get game by ID
 */
export function useGame(id: string) {
  return useQuery({
    queryKey: gameKeys.detail(id),
    queryFn: () => gameService.getGameById(id),
    enabled: shouldEnableQueryWith(!!id),
  });
}

/**
 * Hook to get game statistics
 */
export function useGameStats(id: string) {
  return useQuery({
    queryKey: gameKeys.stats(id),
    queryFn: () => gameService.getGameStats(id),
    enabled: shouldEnableQueryWith(!!id),
  });
}

/**
 * Hook to get game leaderboard
 */
export function useGameLeaderboard(id: string, params?: PaginationParams) {
  return useQuery({
    queryKey: gameKeys.leaderboard(id, params),
    queryFn: () => gameService.getGameLeaderboard(id, params),
    enabled: shouldEnableQueryWith(!!id),
  });
}

/**
 * Hook to create game
 */
export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGameRequest) => gameService.createGame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

/**
 * Hook to update game
 */
export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGameRequest }) =>
      gameService.updateGame(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

/**
 * Hook to delete game
 */
export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gameService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

/**
 * Hook to publish game
 */
export function usePublishGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gameService.publishGame(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

/**
 * Hook to archive game
 */
export function useArchiveGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gameService.archiveGame(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

/**
 * Hook to upload game thumbnail
 */
export function useUploadGameThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      gameService.uploadThumbnail(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(variables.id) });
    },
  });
}
