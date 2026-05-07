/**
 * 과금/구독 hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../api/billing.service';
import { shouldEnableQuery } from './query-utils';
import type { BillingFilterParams } from '../types/billing';
import type { PaginationParams } from '../types/common';

export const billingKeys = {
  all: ['billing'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  subscriptions: () => [...billingKeys.all, 'subscriptions'] as const,
  subscriptionList: (params?: PaginationParams & BillingFilterParams) =>
    [...billingKeys.subscriptions(), params] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  invoiceList: (params?: PaginationParams & BillingFilterParams) =>
    [...billingKeys.invoices(), params] as const,
  failedPayments: () => [...billingKeys.all, 'failed-payments'] as const,
  usage: () => [...billingKeys.all, 'usage'] as const,
  adjustments: () => [...billingKeys.all, 'adjustments'] as const,
  stats: () => [...billingKeys.all, 'stats'] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => billingService.getPlans(),
    enabled: shouldEnableQuery(),
  });
}

export function useSubscriptions(params?: PaginationParams & BillingFilterParams) {
  return useQuery({
    queryKey: billingKeys.subscriptionList(params),
    queryFn: () => billingService.getSubscriptions(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useInvoices(params?: PaginationParams & BillingFilterParams) {
  return useQuery({
    queryKey: billingKeys.invoiceList(params),
    queryFn: () => billingService.getInvoices(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useFailedPayments(params?: PaginationParams) {
  return useQuery({
    queryKey: [...billingKeys.failedPayments(), params],
    queryFn: () => billingService.getFailedPayments(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useUsageStats(params?: PaginationParams) {
  return useQuery({
    queryKey: [...billingKeys.usage(), params],
    queryFn: () => billingService.getUsageStats(params),
    enabled: shouldEnableQuery(),
  });
}

export function useAdjustments(params?: PaginationParams) {
  return useQuery({
    queryKey: [...billingKeys.adjustments(), params],
    queryFn: () => billingService.getAdjustments(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useBillingStats() {
  return useQuery({
    queryKey: billingKeys.stats(),
    queryFn: () => billingService.getBillingStats(),
    enabled: shouldEnableQuery(),
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      partnerId: string;
      adjustmentType: 'CREDIT' | 'DEBIT';
      amount: number;
      reason: string;
    }) => billingService.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.adjustments() });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats() });
    },
  });
}
