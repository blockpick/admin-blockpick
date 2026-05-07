/**
 * 광고/보상 정책 hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { policyService } from '../api/policy.service';
import { shouldEnableQuery } from './query-utils';
import type { AdPolicy, AdLimitPolicy, MissionPolicy, RewardPolicy } from '../types/policy';

export const policyKeys = {
  all: ['policies'] as const,
  adPolicies: () => [...policyKeys.all, 'ad'] as const,
  adLimit: () => [...policyKeys.all, 'ad-limit'] as const,
  missions: () => [...policyKeys.all, 'missions'] as const,
  rewards: () => [...policyKeys.all, 'rewards'] as const,
};

export function useAdPolicies() {
  return useQuery({
    queryKey: policyKeys.adPolicies(),
    queryFn: () => policyService.getAdPolicies(),
    enabled: shouldEnableQuery(),
  });
}

export function useUpdateAdPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdPolicy> }) =>
      policyService.updateAdPolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.adPolicies() });
    },
  });
}

export function useAdLimitPolicy() {
  return useQuery({
    queryKey: policyKeys.adLimit(),
    queryFn: () => policyService.getAdLimitPolicy(),
    enabled: shouldEnableQuery(),
  });
}

export function useUpdateAdLimitPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdLimitPolicy>) => policyService.updateAdLimitPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.adLimit() });
    },
  });
}

export function useMissionPolicies() {
  return useQuery({
    queryKey: policyKeys.missions(),
    queryFn: () => policyService.getMissionPolicies(),
    enabled: shouldEnableQuery(),
  });
}

export function useUpdateMissionPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MissionPolicy> }) =>
      policyService.updateMissionPolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.missions() });
    },
  });
}

export function useRewardPolicies() {
  return useQuery({
    queryKey: policyKeys.rewards(),
    queryFn: () => policyService.getRewardPolicies(),
    enabled: shouldEnableQuery(),
  });
}

export function useUpdateRewardPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RewardPolicy> }) =>
      policyService.updateRewardPolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.rewards() });
    },
  });
}
