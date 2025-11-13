/**
 * Game related types based on OpenAPI spec
 */

import { GameProductDto } from './game-product';

export type GameType = 'DAILY' | 'SELECT' | 'VIBE';
export type Currency = 'CASH' | 'POINT';

// GameStatus type for API responses
export type GameStatusType = 'DRAFT' | 'READY' | 'SCHEDULED' | 'ACTIVE' | 'IN_PROGRESS' | 'PAUSED' | 'SETTLING' | 'ENDED' | 'COMPLETED' | 'FAILED';

// GameStatus enum for backward compatibility with existing code
export enum GameStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  MAINTENANCE = 'MAINTENANCE',
  READY = 'READY',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  SETTLING = 'SETTLING',
  ENDED = 'ENDED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface GameDto {
  id: string;
  title: string;
  description?: string;
  mainProductName?: string;
  type: GameType;
  category?: string;
  status: GameStatusType;
  entryFee: number;
  currency: Currency;
  minEntries: number;
  maxEntries?: number;
  maxEntriesPerUser: number;
  rewardPoint?: number;
  gridRows?: number;
  gridCols?: number;
  visibleFrom?: string;
  startTime?: string;
  endTime?: string;
  allowDuplicate: boolean;
  enableNotification: boolean;
  isRecommended: boolean;
  customRules?: string;
  autoEndOnMax: boolean;
  autoEndOnTime: boolean;
  onchainTxHash?: string;
  onchainContractAddr?: string;
  createdAt: string;
  updatedAt: string;
  gameProducts?: GameProductDto[];
  gameType: GameType;
}

// Legacy interface for backward compatibility
export interface Game extends Omit<GameDto, 'gameType' | 'status'> {
  thumbnailUrl?: string;
  bannerUrl?: string;
  category?: string;
  difficulty?: string;
  minPlayers?: number;
  maxPlayers?: number;
  estimatedPlayTime?: number;
  rewardPoints?: number;
  publishedAt?: string;
  status?: string; // Allow legacy status values like PUBLISHED, ARCHIVED, MAINTENANCE
}

export interface CreateGameInput {
  title: string;
  description?: string;
  mainProductName?: string;
  type: GameType;
  category?: string;
  entryFee: number;
  currency: Currency;
  minEntries: number;
  maxEntries?: number;
  maxEntriesPerUser: number;
  rewardPoint?: number;
  gridRows?: number;
  gridCols?: number;
  visibleFrom?: string;
  startTime?: string;
  endTime?: string;
  allowDuplicate: boolean;
  enableNotification: boolean;
  isRecommended: boolean;
  customRules?: string;
  autoEndOnMax: boolean;
  autoEndOnTime: boolean;
}

export interface UpdateGameInput {
  id: string;
  title?: string;
  description?: string;
  mainProductName?: string;
  type?: GameType;
  category?: string;
  status?: GameStatusType;
  entryFee?: number;
  currency?: Currency;
  minEntries?: number;
  maxEntries?: number;
  maxEntriesPerUser?: number;
  rewardPoint?: number;
  gridRows?: number;
  gridCols?: number;
  visibleFrom?: string;
  startTime?: string;
  endTime?: string;
  allowDuplicate?: boolean;
  enableNotification?: boolean;
  isRecommended?: boolean;
  customRules?: string;
  autoEndOnMax?: boolean;
  autoEndOnTime?: boolean;
  onchainTxHash?: string;
  onchainContractAddr?: string;
}

// Legacy interfaces for backward compatibility
export interface CreateGameRequest extends Partial<CreateGameInput> {
  title: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  category?: string;
  difficulty?: string;
  minPlayers?: number;
  maxPlayers?: number;
  estimatedPlayTime?: number;
  rewardPoints?: number;
}

export interface UpdateGameRequest extends Partial<UpdateGameInput> {
  thumbnailUrl?: string;
  bannerUrl?: string;
  category?: string;
  status?: GameStatusType;
  difficulty?: string;
  minPlayers?: number;
  maxPlayers?: number;
  estimatedPlayTime?: number;
  rewardPoints?: number;
}

export interface GameFilterParams {
  category?: string;
  status?: GameStatusType;
  type?: GameType;
  search?: string;
  title?: string;
}

export interface GameStats {
  [key: string]: unknown; // Stats structure varies
}
