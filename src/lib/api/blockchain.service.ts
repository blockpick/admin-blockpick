/**
 * Blockchain Integration API Service
 * Based on OpenAPI spec: /admin/blockchain/*
 */

import { apiClient } from './client';
import type {
  CreateGameWithBlockchainRequest,
  GameCreationResult,
  ContractDeploymentFailedRequest,
  ContractDeployedRequest,
  EntryStatusResult,
} from '../types/blockchain';

export const blockchainService = {
  /**
   * Create game with blockchain contract deployment
   * POST /admin/blockchain/games
   */
  createGameWithBlockchain: async (
    request: CreateGameWithBlockchainRequest
  ): Promise<GameCreationResult> => {
    return apiClient.post<GameCreationResult>('/admin/blockchain/games', request);
  },

  /**
   * Handle contract deployment failed
   * POST /admin/blockchain/games/{gameId}/contract-deployment-failed
   */
  handleContractDeploymentFailed: async (
    gameId: string,
    request: ContractDeploymentFailedRequest
  ): Promise<void> => {
    return apiClient.post<void>(
      `/admin/blockchain/games/${gameId}/contract-deployment-failed`,
      request
    );
  },

  /**
   * Handle contract deployed successfully
   * POST /admin/blockchain/games/{gameId}/contract-deployed
   */
  handleContractDeployed: async (
    gameId: string,
    request: ContractDeployedRequest
  ): Promise<void> => {
    return apiClient.post<void>(
      `/admin/blockchain/games/${gameId}/contract-deployed`,
      request
    );
  },

  /**
   * Get entry status
   * GET /admin/blockchain/entries/{entryId}/status
   */
  getEntryStatus: async (entryId: string): Promise<EntryStatusResult> => {
    return apiClient.get<EntryStatusResult>(`/admin/blockchain/entries/${entryId}/status`);
  },
};

