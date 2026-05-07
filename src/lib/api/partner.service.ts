/**
 * 파트너 관리 API Service
 * 백엔드 미구현 endpoint는 mock fallback 반환
 */

import { apiClient } from './client';
import type {
  Partner,
  PartnerFilterParams,
  PartnerStats,
  ApprovePartnerRequest,
  RejectPartnerRequest,
  SuspendPartnerRequest,
} from '../types/partner';
import { PartnerStatus, PartnerCategory } from '../types/partner';
import type { PaginationParams } from '../types/common';

// Mock 데이터
const MOCK_PARTNERS: Partner[] = [
  {
    id: '1',
    companyName: '(주)어드락',
    businessNumber: '123-45-67890',
    representativeName: '김대표',
    email: 'partner1@adrock.me',
    phoneNumber: '010-1234-5678',
    category: PartnerCategory.TECH,
    status: PartnerStatus.ACTIVE,
    description: '모바일 게임 전문 파트너사',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    totalGames: 5,
    activeGames: 3,
    totalPlayers: 12000,
  },
  {
    id: '2',
    companyName: '블록픽 코리아',
    businessNumber: '234-56-78901',
    representativeName: '이파트너',
    email: 'partner2@blockpick.net',
    category: PartnerCategory.ENTERTAINMENT,
    status: PartnerStatus.PENDING,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    companyName: '게임스튜디오',
    businessNumber: '345-67-89012',
    representativeName: '박스튜디오',
    email: 'partner3@gamestudio.com',
    category: PartnerCategory.ENTERTAINMENT,
    status: PartnerStatus.SUSPENDED,
    suspendedReason: '약관 위반',
    suspendedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface GetPartnersResponse {
  data: Partner[];
  count: number;
}

export const partnerService = {
  getPartners: async (
    params?: PaginationParams & PartnerFilterParams
  ): Promise<GetPartnersResponse> => {
    try {
      return await apiClient.get<GetPartnersResponse>('/admin/partners', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      let filtered = [...MOCK_PARTNERS];
      if (params?.status) filtered = filtered.filter((p) => p.status === params.status);
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.companyName.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.representativeName.toLowerCase().includes(q)
        );
      }
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      return { data: filtered.slice(page * size, page * size + size), count: filtered.length };
    }
  },

  getPartnerById: async (id: string): Promise<Partner> => {
    try {
      const res = await apiClient.get<{ data: Partner }>(`/admin/partners/${id}`);
      return res.data;
    } catch {
      await delay(200);
      const partner = MOCK_PARTNERS.find((p) => p.id === id);
      if (!partner) throw new Error('파트너를 찾을 수 없습니다.');
      return partner;
    }
  },

  getPartnerStats: async (): Promise<PartnerStats> => {
    try {
      return await apiClient.get<PartnerStats>('/admin/partners/stats');
    } catch {
      await delay(200);
      return {
        total: MOCK_PARTNERS.length,
        pending: MOCK_PARTNERS.filter((p) => p.status === PartnerStatus.PENDING).length,
        active: MOCK_PARTNERS.filter((p) => p.status === PartnerStatus.ACTIVE).length,
        suspended: MOCK_PARTNERS.filter((p) => p.status === PartnerStatus.SUSPENDED).length,
        rejected: MOCK_PARTNERS.filter((p) => p.status === PartnerStatus.REJECTED).length,
      };
    }
  },

  approvePartner: async (req: ApprovePartnerRequest): Promise<void> => {
    try {
      await apiClient.patch<void>(`/admin/partners/${req.partnerId}/approve`, { note: req.note });
    } catch {
      await delay(300);
    }
  },

  rejectPartner: async (req: RejectPartnerRequest): Promise<void> => {
    try {
      await apiClient.patch<void>(`/admin/partners/${req.partnerId}/reject`, {
        reason: req.reason,
      });
    } catch {
      await delay(300);
    }
  },

  suspendPartner: async (req: SuspendPartnerRequest): Promise<void> => {
    try {
      await apiClient.patch<void>(`/admin/partners/${req.partnerId}/suspend`, {
        reason: req.reason,
      });
    } catch {
      await delay(300);
    }
  },

  unsuspendPartner: async (partnerId: string): Promise<void> => {
    try {
      await apiClient.patch<void>(`/admin/partners/${partnerId}/unsuspend`, {});
    } catch {
      await delay(300);
    }
  },
};
