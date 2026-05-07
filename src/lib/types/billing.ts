/**
 * 과금/구독 관련 타입
 */

export enum PlanType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface Plan {
  id: string;
  type: PlanType;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxGames: number;
  maxPlayers: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  partnerId: string;
  partnerName: string;
  planId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  trialEndsAt?: string;
  nextBillingDate?: string;
  monthlyAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  partnerId: string;
  partnerName: string;
  planType: PlanType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface UsageStat {
  partnerId: string;
  partnerName: string;
  planType: PlanType;
  activeGames: number;
  maxGames: number;
  totalPlayers: number;
  maxPlayers: number;
  storageUsedMb: number;
  maxStorageMb: number;
  period: string;
}

export interface BillingAdjustment {
  id: string;
  partnerId: string;
  partnerName: string;
  adjustmentType: 'CREDIT' | 'DEBIT';
  amount: number;
  reason: string;
  appliedBy: string;
  appliedAt: string;
}

export interface BillingFilterParams {
  status?: SubscriptionStatus | PaymentStatus;
  planType?: PlanType;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface BillingStats {
  totalRevenue: number;
  activeSubscriptions: number;
  pastDueCount: number;
  canceledCount: number;
  trialCount: number;
}
