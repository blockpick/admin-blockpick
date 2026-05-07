/**
 * 광고/보상 정책 API Service
 * 백엔드 미구현 endpoint는 mock fallback 반환
 */

import { apiClient } from './client';
import type {
  AdPolicy,
  AdLimitPolicy,
  MissionPolicy,
  RewardPolicy,
} from '../types/policy';
import { AdNetwork, AdType, MissionType } from '../types/policy';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_AD_POLICIES: AdPolicy[] = [
  {
    id: '1',
    name: '리워드 광고 기본 정책',
    adType: AdType.REWARDED,
    network: AdNetwork.ADMOB,
    isEnabled: true,
    dailyLimit: 10,
    cooldownMinutes: 30,
    rewardAmount: 10,
    rewardType: 'POINT',
    description: '리워드 영상 광고 기본 설정',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '전면 광고 정책',
    adType: AdType.INTERSTITIAL,
    network: AdNetwork.ADMOB,
    isEnabled: true,
    dailyLimit: 5,
    cooldownMinutes: 60,
    rewardAmount: 0,
    rewardType: 'POINT',
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_AD_LIMIT: AdLimitPolicy = {
  id: '1',
  name: '기본 광고 제한',
  userDailyLimit: 10,
  globalDailyLimit: 1000000,
  perGameLimit: 5,
  cooldownMinutes: 30,
  isActive: true,
  updatedAt: new Date().toISOString(),
};

const MOCK_MISSIONS: MissionPolicy[] = [
  {
    id: '1',
    missionType: MissionType.DAILY_LOGIN,
    name: '매일 출석',
    description: '매일 앱에 접속하면 포인트를 드립니다.',
    rewardAmount: 5,
    rewardType: 'POINT',
    isEnabled: true,
    resetType: 'DAILY',
    maxCompletions: 1,
    sortOrder: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    missionType: MissionType.WATCH_AD,
    name: '광고 시청',
    description: '광고를 시청하고 포인트를 획득하세요.',
    rewardAmount: 10,
    rewardType: 'POINT',
    isEnabled: true,
    resetType: 'DAILY',
    maxCompletions: 5,
    sortOrder: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    missionType: MissionType.INVITE_FRIEND,
    name: '친구 초대',
    description: '친구를 초대하면 보너스 포인트를 드립니다.',
    rewardAmount: 100,
    rewardType: 'POINT',
    isEnabled: true,
    resetType: 'ONCE',
    maxCompletions: 10,
    sortOrder: 3,
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_REWARDS: RewardPolicy[] = [
  {
    id: '1',
    name: '게임 참여 보상',
    eventType: 'GAME_PARTICIPATE',
    rewardAmount: 5,
    rewardType: 'POINT',
    isEnabled: true,
    description: '블록픽 게임 참여 시 지급',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '당첨 보상',
    eventType: 'GAME_WIN',
    rewardAmount: 50,
    rewardType: 'POINT',
    isEnabled: true,
    description: '블록픽 게임 당첨 시 지급',
    updatedAt: new Date().toISOString(),
  },
];

export const policyService = {
  getAdPolicies: async (): Promise<AdPolicy[]> => {
    try {
      const res = await apiClient.get<{ data: AdPolicy[] }>('/admin/policies/ad');
      return res.data;
    } catch {
      await delay(300);
      return MOCK_AD_POLICIES;
    }
  },

  updateAdPolicy: async (id: string, data: Partial<AdPolicy>): Promise<void> => {
    try {
      await apiClient.put<void>(`/admin/policies/ad/${id}`, data);
    } catch {
      await delay(300);
    }
  },

  getAdLimitPolicy: async (): Promise<AdLimitPolicy> => {
    try {
      const res = await apiClient.get<{ data: AdLimitPolicy }>('/admin/policies/ad-limit');
      return res.data;
    } catch {
      await delay(200);
      return MOCK_AD_LIMIT;
    }
  },

  updateAdLimitPolicy: async (data: Partial<AdLimitPolicy>): Promise<void> => {
    try {
      await apiClient.put<void>('/admin/policies/ad-limit', data);
    } catch {
      await delay(300);
    }
  },

  getMissionPolicies: async (): Promise<MissionPolicy[]> => {
    try {
      const res = await apiClient.get<{ data: MissionPolicy[] }>('/admin/policies/mission');
      return res.data;
    } catch {
      await delay(300);
      return MOCK_MISSIONS;
    }
  },

  updateMissionPolicy: async (id: string, data: Partial<MissionPolicy>): Promise<void> => {
    try {
      await apiClient.put<void>(`/admin/policies/mission/${id}`, data);
    } catch {
      await delay(300);
    }
  },

  getRewardPolicies: async (): Promise<RewardPolicy[]> => {
    try {
      const res = await apiClient.get<{ data: RewardPolicy[] }>('/admin/policies/reward');
      return res.data;
    } catch {
      await delay(300);
      return MOCK_REWARDS;
    }
  },

  updateRewardPolicy: async (id: string, data: Partial<RewardPolicy>): Promise<void> => {
    try {
      await apiClient.put<void>(`/admin/policies/reward/${id}`, data);
    } catch {
      await delay(300);
    }
  },
};
