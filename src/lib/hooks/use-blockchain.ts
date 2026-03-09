/**
 * Blockchain management hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blockchainService } from '../api';
import { gameService } from '../api';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';
import type { EntryStatusResult, ContractVerificationResult } from '../types/blockchain';

/**
 * Query keys for blockchain-related queries
 */
export const blockchainKeys = {
  all: ['blockchain'] as const,
  contracts: () => [...blockchainKeys.all, 'contracts'] as const,
  contract: (gameId: string) => [...blockchainKeys.contracts(), gameId] as const,
  transactions: () => [...blockchainKeys.all, 'transactions'] as const,
  transaction: (txHash: string) => [...blockchainKeys.transactions(), txHash] as const,
  entryStatus: (entryId: string) => [...blockchainKeys.all, 'entry', entryId] as const,
};

/**
 * Hook to get contract information for a game
 */
export function useContractInfo(gameId: string) {
  return useQuery({
    queryKey: blockchainKeys.contract(gameId),
    queryFn: () => blockchainService.getContractInfo(gameId),
    enabled: shouldEnableQueryWith(!!gameId),
    retry: false, // Don't retry if contract doesn't exist
  });
}

/**
 * Hook to get transaction by hash
 */
export function useTransaction(txHash: string) {
  return useQuery({
    queryKey: blockchainKeys.transaction(txHash),
    queryFn: () => blockchainService.getTransaction(txHash),
    enabled: shouldEnableQueryWith(!!txHash),
  });
}

/**
 * Hook to get entry status
 */
export function useEntryStatus(entryId: string) {
  return useQuery({
    queryKey: blockchainKeys.entryStatus(entryId),
    queryFn: () => blockchainService.getEntryStatus(entryId),
    enabled: shouldEnableQueryWith(!!entryId),
  });
}

/**
 * Hook to handle contract deployment failed
 */
export function useHandleContractDeploymentFailed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      errorCode,
      errorMessage,
    }: {
      gameId: string;
      errorCode: string;
      errorMessage: string;
    }) => {
      return blockchainService.handleContractDeploymentFailed(gameId, {
        errorCode,
        errorMessage,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blockchainKeys.contract(variables.gameId) });
    },
  });
}

/**
 * 컨트랙트 수동 검증 훅
 */
export function useVerifyContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => blockchainService.verifyContract(gameId),
    onSuccess: (_, gameId) => {
      // 검증 완료 후 해당 게임의 컨트랙트 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: blockchainKeys.contract(gameId) });
    },
  });
}

/**
 * Hook to handle contract deployed successfully
 */
export function useHandleContractDeployed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      contractAddress,
      deploymentTxHash,
    }: {
      gameId: string;
      contractAddress: string;
      deploymentTxHash: string;
    }) => {
      return blockchainService.handleContractDeployed(gameId, {
        contractAddress,
        deploymentTxHash,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blockchainKeys.contract(variables.gameId) });
    },
  });
}

/**
 * Hook to get all contracts (fetches all games and their contract info)
 */
export function useAllContracts() {
  return useQuery({
    queryKey: [...blockchainKeys.contracts(), 'all'],
    queryFn: async () => {
      // Get all games first
      const gamesResponse = await gameService.getGames({ page: 0, size: 1000 });
      const games = gamesResponse.content || [];

      // Fetch contract info for each game (in parallel)
      const contractPromises = games.map(async (game) => {
        try {
          const contractInfo = await blockchainService.getContractInfo(game.id);
          return {
            gameId: game.id,
            gameTitle: game.title,
            ...contractInfo,
          };
        } catch (error) {
          // Game might not have a contract deployed
          return {
            gameId: game.id,
            gameTitle: game.title,
            status: 'NOT_DEPLOYED',
          };
        }
      });

      const contracts = await Promise.all(contractPromises);
      return contracts.filter((c) => c.status !== 'NOT_DEPLOYED');
    },
    enabled: shouldEnableQuery(),
  });
}

