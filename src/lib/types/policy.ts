/**
 * 광고/보상 정책 관련 타입
 */

export enum AdNetwork {
  ADMOB = 'ADMOB',
  UNITY = 'UNITY',
  APPLOVIN = 'APPLOVIN',
  IRON_SOURCE = 'IRON_SOURCE',
}

export enum AdType {
  REWARDED = 'REWARDED',
  INTERSTITIAL = 'INTERSTITIAL',
  BANNER = 'BANNER',
}

export enum MissionType {
  DAILY_LOGIN = 'DAILY_LOGIN',
  WATCH_AD = 'WATCH_AD',
  PLAY_GAME = 'PLAY_GAME',
  INVITE_FRIEND = 'INVITE_FRIEND',
  COMPLETE_PROFILE = 'COMPLETE_PROFILE',
  SHARE = 'SHARE',
}

export interface AdPolicy {
  id: string;
  name: string;
  adType: AdType;
  network: AdNetwork;
  isEnabled: boolean;
  dailyLimit: number;
  cooldownMinutes: number;
  rewardAmount: number;
  rewardType: 'POINT' | 'CASH' | 'TICKET';
  startDate?: string;
  endDate?: string;
  description?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface AdLimitPolicy {
  id: string;
  name: string;
  userDailyLimit: number;
  globalDailyLimit: number;
  perGameLimit: number;
  cooldownMinutes: number;
  isActive: boolean;
  updatedAt: string;
}

export interface MissionPolicy {
  id: string;
  missionType: MissionType;
  name: string;
  description: string;
  rewardAmount: number;
  rewardType: 'POINT' | 'CASH' | 'TICKET';
  isEnabled: boolean;
  resetType: 'DAILY' | 'WEEKLY' | 'ONCE';
  maxCompletions: number;
  sortOrder: number;
  updatedAt: string;
}

export interface RewardPolicy {
  id: string;
  name: string;
  eventType: string;
  rewardAmount: number;
  rewardType: 'POINT' | 'CASH' | 'TICKET';
  isEnabled: boolean;
  description?: string;
  conditions?: Record<string, unknown>;
  updatedAt: string;
  updatedBy?: string;
}

export interface PolicyFilterParams {
  isEnabled?: boolean;
  search?: string;
}
