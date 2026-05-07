/**
 * 과금/구독 API Service
 * 백엔드 미구현 endpoint는 mock fallback 반환
 */

import { apiClient } from './client';
import type {
  Plan,
  Subscription,
  Invoice,
  UsageStat,
  BillingAdjustment,
  BillingFilterParams,
  BillingStats,
} from '../types/billing';
import {
  PlanType,
  SubscriptionStatus,
  PaymentStatus,
  BillingCycle,
} from '../types/billing';
import type { PaginationParams } from '../types/common';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_PLANS: Plan[] = [
  {
    id: '1',
    type: PlanType.FREE,
    name: '무료',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxGames: 1,
    maxPlayers: 100,
    features: ['기본 블록픽 1개', '100명 참여자'],
    isActive: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: PlanType.STARTER,
    name: '스타터',
    monthlyPrice: 99000,
    yearlyPrice: 990000,
    maxGames: 5,
    maxPlayers: 1000,
    features: ['블록픽 5개', '1,000명 참여자', '기본 분석'],
    isActive: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: PlanType.PRO,
    name: '프로',
    monthlyPrice: 299000,
    yearlyPrice: 2990000,
    maxGames: 20,
    maxPlayers: 10000,
    features: ['블록픽 20개', '10,000명 참여자', '고급 분석', '우선 지원'],
    isActive: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    partnerId: '1',
    partnerName: '(주)어드락',
    planId: '3',
    planType: PlanType.PRO,
    status: SubscriptionStatus.ACTIVE,
    billingCycle: BillingCycle.MONTHLY,
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    monthlyAmount: 299000,
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    partnerId: '2',
    partnerName: '블록픽 코리아',
    planId: '1',
    planType: PlanType.FREE,
    status: SubscriptionStatus.TRIAL,
    billingCycle: BillingCycle.MONTHLY,
    currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    monthlyAmount: 0,
    trialEndsAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    subscriptionId: '1',
    partnerId: '1',
    partnerName: '(주)어드락',
    planType: PlanType.PRO,
    amount: 299000,
    currency: 'KRW',
    status: PaymentStatus.SUCCESS,
    billingPeriodStart: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    billingPeriodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    subscriptionId: '3',
    partnerId: '3',
    partnerName: '게임스튜디오',
    planType: PlanType.STARTER,
    amount: 99000,
    currency: 'KRW',
    status: PaymentStatus.FAILED,
    billingPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    billingPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    failedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    failureReason: '카드 한도 초과',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export interface GetSubscriptionsResponse {
  data: Subscription[];
  count: number;
}

export interface GetInvoicesResponse {
  data: Invoice[];
  count: number;
}

export interface GetUsageStatsResponse {
  data: UsageStat[];
  count: number;
}

export interface GetAdjustmentsResponse {
  data: BillingAdjustment[];
  count: number;
}

export const billingService = {
  getPlans: async (): Promise<Plan[]> => {
    try {
      const res = await apiClient.get<{ data: Plan[] }>('/admin/billing/plans');
      return res.data;
    } catch {
      await delay(200);
      return MOCK_PLANS;
    }
  },

  getSubscriptions: async (
    params?: PaginationParams & BillingFilterParams
  ): Promise<GetSubscriptionsResponse> => {
    try {
      return await apiClient.get<GetSubscriptionsResponse>('/admin/billing/subscriptions', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      let filtered = [...MOCK_SUBSCRIPTIONS];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((s) => s.partnerName.toLowerCase().includes(q));
      }
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      return { data: filtered.slice(page * size, page * size + size), count: filtered.length };
    }
  },

  getInvoices: async (
    params?: PaginationParams & BillingFilterParams
  ): Promise<GetInvoicesResponse> => {
    try {
      return await apiClient.get<GetInvoicesResponse>('/admin/billing/invoices', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      let filtered = [...MOCK_INVOICES];
      if (params?.status) filtered = filtered.filter((i) => i.status === params.status);
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      return { data: filtered.slice(page * size, page * size + size), count: filtered.length };
    }
  },

  getFailedPayments: async (
    params?: PaginationParams
  ): Promise<GetInvoicesResponse> => {
    try {
      return await apiClient.get<GetInvoicesResponse>('/admin/billing/invoices/failed', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      const failed = MOCK_INVOICES.filter((i) => i.status === PaymentStatus.FAILED);
      return { data: failed, count: failed.length };
    }
  },

  getUsageStats: async (
    params?: PaginationParams
  ): Promise<GetUsageStatsResponse> => {
    try {
      return await apiClient.get<GetUsageStatsResponse>('/admin/billing/usage', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      return { data: [], count: 0 };
    }
  },

  getAdjustments: async (
    params?: PaginationParams
  ): Promise<GetAdjustmentsResponse> => {
    try {
      return await apiClient.get<GetAdjustmentsResponse>('/admin/billing/adjustments', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      return { data: [], count: 0 };
    }
  },

  getBillingStats: async (): Promise<BillingStats> => {
    try {
      return await apiClient.get<BillingStats>('/admin/billing/stats');
    } catch {
      await delay(200);
      return {
        totalRevenue: 299000,
        activeSubscriptions: MOCK_SUBSCRIPTIONS.filter(
          (s) => s.status === SubscriptionStatus.ACTIVE
        ).length,
        pastDueCount: 1,
        canceledCount: 0,
        trialCount: MOCK_SUBSCRIPTIONS.filter((s) => s.status === SubscriptionStatus.TRIAL)
          .length,
      };
    }
  },

  createAdjustment: async (data: {
    partnerId: string;
    adjustmentType: 'CREDIT' | 'DEBIT';
    amount: number;
    reason: string;
  }): Promise<void> => {
    try {
      await apiClient.post<void>('/admin/billing/adjustments', data);
    } catch {
      await delay(300);
    }
  },
};
