/**
 * Game-Product Integration API Service
 * Based on OpenAPI spec: /admin/game-product-management/*
 */

import { apiClient } from './client';
import type {
  GameProductDto,
  GameProductRegionDto,
  CreateGameProductInput,
  UpdateGameProductInput,
  CreateGameProductRegionInput,
  LinkProductToGameRequest,
  AddProductToGameRequest,
  ReorderProductsRequest,
  SetGrandPrizesRequest,
  GameProductCountResponse,
} from '../types/game-product';

export const gameProductService = {
  /**
   * Get all game products for a game
   * GET /admin/game-product-management/games/{gameId}/products
   */
  getGameProducts: async (
    gameId: string,
    activeOnly?: boolean
  ): Promise<GameProductDto[]> => {
    return apiClient.get<GameProductDto[]>(
      `/admin/game-product-management/games/${gameId}/products`,
      {
        params: activeOnly !== undefined ? { activeOnly } : undefined,
      }
    );
  },

  /**
   * Get game products ordered by sequence
   * GET /admin/game-product-management/games/{gameId}/products/ordered
   */
  getGameProductsOrdered: async (gameId: string): Promise<GameProductDto[]> => {
    return apiClient.get<GameProductDto[]>(
      `/admin/game-product-management/games/${gameId}/products/ordered`
    );
  },

  /**
   * Get complete game products with all details
   * GET /admin/game-product-management/games/{gameId}/products/all-details
   */
  getCompleteGameProducts: async (gameId: string): Promise<GameProductDto[]> => {
    return apiClient.get<GameProductDto[]>(
      `/admin/game-product-management/games/${gameId}/products/all-details`
    );
  },

  /**
   * Get game product count
   * GET /admin/game-product-management/games/{gameId}/products/count
   */
  getGameProductCount: async (
    gameId: string,
    activeOnly?: boolean
  ): Promise<GameProductCountResponse> => {
    return apiClient.get<GameProductCountResponse>(
      `/admin/game-product-management/games/${gameId}/products/count`,
      {
        params: activeOnly !== undefined ? { activeOnly } : undefined,
      }
    );
  },

  /**
   * Get grand prize products for a game
   * GET /admin/game-product-management/games/{gameId}/grand-prizes
   */
  getGrandPrizeProducts: async (gameId: string): Promise<GameProductDto[]> => {
    return apiClient.get<GameProductDto[]>(
      `/admin/game-product-management/games/${gameId}/grand-prizes`
    );
  },

  /**
   * Set grand prize products
   * PUT /admin/game-product-management/games/{gameId}/grand-prizes
   */
  setGrandPrizeProducts: async (
    gameId: string,
    request: SetGrandPrizesRequest
  ): Promise<GameProductDto[]> => {
    return apiClient.put<GameProductDto[]>(
      `/admin/game-product-management/games/${gameId}/grand-prizes`,
      request
    );
  },

  /**
   * Get game product by ID
   * GET /admin/game-product-management/game-products/{id}
   */
  getGameProduct: async (id: string): Promise<GameProductDto> => {
    return apiClient.get<GameProductDto>(`/admin/game-product-management/game-products/${id}`);
  },

  /**
   * Create new game product slot
   * POST /admin/game-product-management/game-products
   */
  createGameProduct: async (data: CreateGameProductInput): Promise<GameProductDto> => {
    return apiClient.post<GameProductDto>('/admin/game-product-management/game-products', data);
  },

  /**
   * Update game product slot
   * PUT /admin/game-product-management/game-products
   */
  updateGameProduct: async (data: UpdateGameProductInput): Promise<GameProductDto> => {
    return apiClient.put<GameProductDto>('/admin/game-product-management/game-products', data);
  },

  /**
   * Delete game product slot
   * DELETE /admin/game-product-management/game-products/{id}
   */
  deleteGameProduct: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/admin/game-product-management/game-products/${id}`);
  },

  /**
   * Remove product completely from game (including regions)
   * DELETE /admin/game-product-management/game-products/{gameProductId}/complete
   */
  removeProductFromGame: async (gameProductId: string): Promise<void> => {
    return apiClient.delete<void>(
      `/admin/game-product-management/game-products/${gameProductId}/complete`
    );
  },

  /**
   * Link existing product to game
   * POST /admin/game-product-management/games/{gameId}/products/{productId}/link
   */
  linkExistingProductToGame: async (
    gameId: string,
    productId: string,
    request: LinkProductToGameRequest
  ): Promise<GameProductDto> => {
    return apiClient.post<GameProductDto>(
      `/admin/game-product-management/games/${gameId}/products/${productId}/link`,
      request
    );
  },

  /**
   * Add new product to game (integrated: create product + link + regions)
   * POST /admin/game-product-management/games/{gameId}/products/complete
   */
  addProductToGame: async (
    gameId: string,
    request: AddProductToGameRequest
  ): Promise<GameProductDto> => {
    return apiClient.post<GameProductDto>(
      `/admin/game-product-management/games/${gameId}/products/complete`,
      request
    );
  },

  /**
   * Reorder game products
   * PUT /admin/game-product-management/games/{gameId}/products/reorder
   */
  reorderGameProducts: async (
    gameId: string,
    request: ReorderProductsRequest
  ): Promise<GameProductDto[]> => {
    return apiClient.put<GameProductDto[]>(
      `/admin/game-product-management/games/${gameId}/products/reorder`,
      request
    );
  },

  /**
   * Add region settings to game product
   * POST /admin/game-product-management/game-products/{gameProductId}/regions
   */
  addRegionSettings: async (
    gameProductId: string,
    regions: CreateGameProductRegionInput[]
  ): Promise<GameProductRegionDto[]> => {
    return apiClient.post<GameProductRegionDto[]>(
      `/admin/game-product-management/game-products/${gameProductId}/regions`,
      regions
    );
  },

  /**
   * Update region settings for game product
   * PUT /admin/game-product-management/game-products/{gameProductId}/regions/{regionId}
   */
  updateRegionSettings: async (
    gameProductId: string,
    regionId: string,
    region: Partial<CreateGameProductRegionInput>
  ): Promise<GameProductRegionDto> => {
    return apiClient.put<GameProductRegionDto>(
      `/admin/game-product-management/game-products/${gameProductId}/regions/${regionId}`,
      region
    );
  },

  /**
   * Delete region settings for game product
   * DELETE /admin/game-product-management/game-products/{gameProductId}/regions/{regionId}
   */
  deleteRegionSettings: async (
    gameProductId: string,
    regionId: string
  ): Promise<void> => {
    return apiClient.delete<void>(
      `/admin/game-product-management/game-products/${gameProductId}/regions/${regionId}`
    );
  },

  /**
   * Get game product statistics
   * GET /admin/game-product-management/games/{gameId}/products/stats
   */
  getGameProductStats: async (gameId: string): Promise<{
    total: number;
    active: number;
    grandPrizes: number;
    byRegion: Record<string, number>;
    [key: string]: unknown;
  }> => {
    return apiClient.get<{
      total: number;
      active: number;
      grandPrizes: number;
      byRegion: Record<string, number>;
      [key: string]: unknown;
    }>(`/admin/game-product-management/games/${gameId}/products/stats`);
  },
};

