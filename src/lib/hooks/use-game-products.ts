/**
 * Game-Product management hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gameProductService } from '../api';
import type {
  CreateGameProductInput,
  UpdateGameProductInput,
  CreateGameProductRegionInput,
  LinkProductToGameRequest,
  AddProductToGameRequest,
  ReorderProductsRequest,
  SetGrandPrizesRequest,
} from '../types/game-product';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';

/**
 * Query keys for game-product-related queries
 */
export const gameProductKeys = {
  all: ['game-products'] as const,
  lists: () => [...gameProductKeys.all, 'list'] as const,
  list: (gameId: string) => [...gameProductKeys.lists(), gameId] as const,
  details: () => [...gameProductKeys.all, 'detail'] as const,
  detail: (id: string) => [...gameProductKeys.details(), id] as const,
  stats: (gameId: string) => [...gameProductKeys.all, 'stats', gameId] as const,
  grandPrizes: (gameId: string) => [...gameProductKeys.all, 'grand-prizes', gameId] as const,
};

/**
 * Hook to get game products for a game
 */
export function useGameProducts(gameId: string, activeOnly?: boolean) {
  return useQuery({
    queryKey: [...gameProductKeys.list(gameId), activeOnly],
    queryFn: () => gameProductService.getGameProducts(gameId, activeOnly),
    enabled: shouldEnableQueryWith(!!gameId),
  });
}

/**
 * Hook to get game products ordered by sequence
 */
export function useGameProductsOrdered(gameId: string) {
  return useQuery({
    queryKey: [...gameProductKeys.list(gameId), 'ordered'],
    queryFn: () => gameProductService.getGameProductsOrdered(gameId),
    enabled: shouldEnableQueryWith(!!gameId),
  });
}

/**
 * Hook to get complete game products with all details
 */
export function useCompleteGameProducts(gameId: string) {
  return useQuery({
    queryKey: [...gameProductKeys.list(gameId), 'complete'],
    queryFn: () => gameProductService.getCompleteGameProducts(gameId),
    enabled: shouldEnableQueryWith(!!gameId),
  });
}

/**
 * Hook to get game product by ID
 */
export function useGameProduct(id: string) {
  return useQuery({
    queryKey: gameProductKeys.detail(id),
    queryFn: () => gameProductService.getGameProduct(id),
    enabled: shouldEnableQueryWith(!!id),
  });
}

/**
 * Hook to get grand prize products for a game
 */
export function useGrandPrizeProducts(gameId: string) {
  return useQuery({
    queryKey: gameProductKeys.grandPrizes(gameId),
    queryFn: () => gameProductService.getGrandPrizeProducts(gameId),
    enabled: shouldEnableQueryWith(!!gameId),
  });
}

/**
 * Hook to get game product statistics
 */
export function useGameProductStats(gameId: string) {
  return useQuery({
    queryKey: gameProductKeys.stats(gameId),
    queryFn: () => gameProductService.getGameProductStats(gameId),
    enabled: shouldEnableQueryWith(!!gameId),
  });
}

/**
 * Hook to create game product
 */
export function useCreateGameProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGameProductInput) => gameProductService.createGameProduct(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.list(variables.gameId) });
      queryClient.invalidateQueries({ queryKey: gameProductKeys.stats(variables.gameId) });
    },
  });
}

/**
 * Hook to update game product
 */
export function useUpdateGameProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGameProductInput) => gameProductService.updateGameProduct(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: gameProductKeys.all });
    },
  });
}

/**
 * Hook to delete game product
 */
export function useDeleteGameProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gameProductService.deleteGameProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.all });
    },
  });
}

/**
 * Hook to link existing product to game
 */
export function useLinkProductToGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      productId,
      request,
    }: {
      gameId: string;
      productId: string;
      request: LinkProductToGameRequest;
    }) => gameProductService.linkExistingProductToGame(gameId, productId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.list(variables.gameId) });
      queryClient.invalidateQueries({ queryKey: gameProductKeys.stats(variables.gameId) });
    },
  });
}

/**
 * Hook to add new product to game
 */
export function useAddProductToGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      request,
    }: {
      gameId: string;
      request: AddProductToGameRequest;
    }) => gameProductService.addProductToGame(gameId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.list(variables.gameId) });
      queryClient.invalidateQueries({ queryKey: gameProductKeys.stats(variables.gameId) });
    },
  });
}

/**
 * Hook to reorder game products
 */
export function useReorderGameProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, request }: { gameId: string; request: ReorderProductsRequest }) =>
      gameProductService.reorderGameProducts(gameId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.list(variables.gameId) });
    },
  });
}

/**
 * Hook to set grand prize products
 */
export function useSetGrandPrizes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, request }: { gameId: string; request: SetGrandPrizesRequest }) =>
      gameProductService.setGrandPrizeProducts(gameId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.grandPrizes(variables.gameId) });
      queryClient.invalidateQueries({ queryKey: gameProductKeys.list(variables.gameId) });
    },
  });
}

/**
 * Hook to add region settings
 */
export function useAddRegionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameProductId,
      regions,
    }: {
      gameProductId: string;
      regions: CreateGameProductRegionInput[];
    }) => gameProductService.addRegionSettings(gameProductId, regions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.all });
    },
  });
}

/**
 * Hook to update region settings
 */
export function useUpdateRegionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameProductId,
      regionId,
      region,
    }: {
      gameProductId: string;
      regionId: string;
      region: Partial<CreateGameProductRegionInput>;
    }) => gameProductService.updateRegionSettings(gameProductId, regionId, region),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.all });
    },
  });
}

/**
 * Hook to delete region settings
 */
export function useDeleteRegionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameProductId,
      regionId,
    }: {
      gameProductId: string;
      regionId: string;
    }) => gameProductService.deleteRegionSettings(gameProductId, regionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameProductKeys.all });
    },
  });
}

