/**
 * Game related types
 */

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  category: GameCategory;
  status: GameStatus;
  difficulty: GameDifficulty;
  minPlayers: number;
  maxPlayers: number;
  estimatedPlayTime: number;
  rewardPoints: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export enum GameCategory {
  ACTION = 'ACTION',
  PUZZLE = 'PUZZLE',
  STRATEGY = 'STRATEGY',
  SPORTS = 'SPORTS',
  CASUAL = 'CASUAL',
  ADVENTURE = 'ADVENTURE',
}

export enum GameStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum GameDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export interface CreateGameRequest {
  title: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  minPlayers: number;
  maxPlayers: number;
  estimatedPlayTime: number;
  rewardPoints: number;
}

export interface UpdateGameRequest {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  category?: GameCategory;
  status?: GameStatus;
  difficulty?: GameDifficulty;
  minPlayers?: number;
  maxPlayers?: number;
  estimatedPlayTime?: number;
  rewardPoints?: number;
}

export interface GameFilterParams {
  category?: GameCategory;
  status?: GameStatus;
  difficulty?: GameDifficulty;
  search?: string;
}

export interface GameStats {
  gameId: string;
  totalPlays: number;
  uniquePlayers: number;
  averageScore: number;
  averagePlayTime: number;
  completionRate: number;
}
