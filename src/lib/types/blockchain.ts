/**
 * Blockchain integration types based on OpenAPI spec
 */

import type { GameDto, CreateGameInput } from './game';

export interface CreateGameWithBlockchainRequest {
  gameInput: CreateGameInput;
  deployContract: boolean;
}

export interface GameCreationResult {
  success: boolean;
  game?: GameDto;
  contractDeploymentRequested: boolean;
  message: string;
  errorCode?: string;
  deploymentTxHash?: string;
  contractAddress?: string;
  deploymentStatus?: 'PENDING' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED';
}

export interface ContractDeploymentFailedRequest {
  errorCode: string;
  errorMessage: string;
}

export interface ContractDeployedRequest {
  contractAddress: string;
  deploymentTxHash: string;
}

export interface EntryStatusResult {
  entryId: string;
  status: string;
  txIntents: TxIntentInfo[];
  // 스펙 추가 필드
  txHash?: string;
  errorCode?: string | null;
  errorMessage?: string | null;
}

// 컨트랙트 수동 검증 결과 타입 (스펙: POST /admin/blockchain/games/{gameId}/verify-contract)
export interface ContractVerificationResult {
  success: boolean;
  message: string;
  verificationUrl: string;
  guid: string;
}

export interface TxIntentInfo {
  intentId: string;
  status: string;
  txHash?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

