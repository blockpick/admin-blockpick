/**
 * Game management hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gameService, blockchainService } from '../api';
import type {
  CreateGameRequest,
  UpdateGameRequest,
  GameFilterParams,
  CreateGameInput,
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
    // 검색어가 있을 때는 이전 데이터를 표시하지 않음 (검색 결과가 즉시 반영되도록)
    placeholderData: params?.search || params?.title ? undefined : (previousData) => previousData,
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
export function useGameStats() {
  return useQuery({
    queryKey: gameKeys.stats('all'),
    queryFn: () => gameService.getGameStats(),
    enabled: shouldEnableQuery(),
  });
}

/**
 * Hook to get game leaderboard
 * Note: This endpoint may not be available in the current API
 */
export function useGameLeaderboard(id: string, params?: PaginationParams) {
  return useQuery({
    queryKey: gameKeys.leaderboard(id, params),
    queryFn: async () => {
      // Placeholder - implement when endpoint is available
      throw new Error('Game leaderboard endpoint not available');
    },
    enabled: false, // Disabled until endpoint is available
  });
}

/**
 * Hook to create game with blockchain
 */
export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameInput,
      deployContract = false,
    }: {
      gameInput: CreateGameInput;
      deployContract?: boolean;
    }) => {
      return blockchainService.createGameWithBlockchain({
        gameInput,
        deployContract,
      });
    },
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
      gameService.updateGame({ ...data, id }),
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
    mutationFn: async (id: string) => gameService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

/**
 * 게임 정산 훅
 */
export function useSettleGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gameService.settleGame(id),
    onSuccess: (_, id) => {
      // 정산 완료 후 해당 게임 상세 및 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
}

/**
 * Hook to force end game
 */
export function useForceEndGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gameService.forceEndGame(id),
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
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      // Placeholder - use storageService.uploadImage instead
      throw new Error('Use storageService.uploadImage instead');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(variables.id) });
    },
  });
}
