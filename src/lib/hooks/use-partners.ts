/**
 * 파트너 관리 hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { partnerService } from '../api/partner.service';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';
import type { PartnerFilterParams, ApprovePartnerRequest, RejectPartnerRequest, SuspendPartnerRequest } from '../types/partner';
import type { PaginationParams } from '../types/common';

export const partnerKeys = {
  all: ['partners'] as const,
  lists: () => [...partnerKeys.all, 'list'] as const,
  list: (params?: PaginationParams & PartnerFilterParams) => [...partnerKeys.lists(), params] as const,
  details: () => [...partnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
  stats: () => [...partnerKeys.all, 'stats'] as const,
};

export function usePartners(params?: PaginationParams & PartnerFilterParams) {
  return useQuery({
    queryKey: partnerKeys.list(params),
    queryFn: () => partnerService.getPartners(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => partnerService.getPartnerById(id),
    enabled: shouldEnableQueryWith(!!id),
  });
}

export function usePartnerStats() {
  return useQuery({
    queryKey: partnerKeys.stats(),
    queryFn: () => partnerService.getPartnerStats(),
    enabled: shouldEnableQuery(),
  });
}

export function useApprovePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: ApprovePartnerRequest) => partnerService.approvePartner(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
    },
  });
}

export function useRejectPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: RejectPartnerRequest) => partnerService.rejectPartner(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
    },
  });
}

export function useSuspendPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: SuspendPartnerRequest) => partnerService.suspendPartner(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
    },
  });
}

export function useUnsuspendPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerId: string) => partnerService.unsuspendPartner(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
    },
  });
}
