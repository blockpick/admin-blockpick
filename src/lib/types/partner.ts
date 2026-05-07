/**
 * 파트너 관리 관련 타입
 */

export enum PartnerStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export enum PartnerCategory {
  RETAIL = 'RETAIL',
  FOOD = 'FOOD',
  ENTERTAINMENT = 'ENTERTAINMENT',
  TRAVEL = 'TRAVEL',
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  TECH = 'TECH',
  OTHER = 'OTHER',
}

export interface Partner {
  id: string;
  companyName: string;
  businessNumber: string;
  representativeName: string;
  email: string;
  phoneNumber?: string;
  category: PartnerCategory;
  status: PartnerStatus;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  address?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  approvedAt?: string;
  approvedBy?: string;
  suspendedAt?: string;
  suspendedReason?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  // 통계
  totalGames?: number;
  activeGames?: number;
  totalPlayers?: number;
}

export interface PartnerFilterParams {
  status?: PartnerStatus;
  category?: PartnerCategory;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApprovePartnerRequest {
  partnerId: string;
  note?: string;
}

export interface RejectPartnerRequest {
  partnerId: string;
  reason: string;
}

export interface SuspendPartnerRequest {
  partnerId: string;
  reason: string;
}

export interface PartnerStats {
  total: number;
  pending: number;
  active: number;
  suspended: number;
  rejected: number;
}
