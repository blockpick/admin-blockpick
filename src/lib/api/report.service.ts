/**
 * 신고/제재 API Service
 * 백엔드 미구현 endpoint는 mock fallback 반환
 */

import { apiClient } from './client';
import type {
  Report,
  Sanction,
  ReportFilterParams,
  ProcessReportRequest,
  ReportStats,
} from '../types/report';
import {
  ReportStatus,
  ReportType,
  ReportReason,
  SanctionType,
} from '../types/report';
import type { PaginationParams } from '../types/common';

const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    type: ReportType.GAME,
    reason: ReportReason.FRAUD,
    status: ReportStatus.PENDING,
    targetId: 'game-1',
    targetName: '블록픽 챔피언십',
    reporterEmail: 'user1@example.com',
    description: '게임 결과가 조작된 것 같습니다.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: ReportType.USER,
    reason: ReportReason.SPAM,
    status: ReportStatus.PROCESSED,
    targetId: 'user-2',
    targetName: '스팸유저@example.com',
    reporterEmail: 'user2@example.com',
    processingNote: '7일 정지 처리 완료',
    sanctionApplied: SanctionType.SUSPEND_7,
    processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    processedBy: 'admin@blockpick.net',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_SANCTIONS: Sanction[] = [
  {
    id: '1',
    reportId: '2',
    targetId: 'user-2',
    targetName: '스팸유저@example.com',
    targetType: ReportType.USER,
    sanctionType: SanctionType.SUSPEND_7,
    reason: '스팸 행위',
    appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    appliedBy: 'admin@blockpick.net',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface GetReportsResponse {
  data: Report[];
  count: number;
}

export interface GetSanctionsResponse {
  data: Sanction[];
  count: number;
}

export const reportService = {
  getReports: async (
    params?: PaginationParams & ReportFilterParams
  ): Promise<GetReportsResponse> => {
    try {
      return await apiClient.get<GetReportsResponse>('/admin/reports', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      let filtered = [...MOCK_REPORTS];
      if (params?.status) filtered = filtered.filter((r) => r.status === params.status);
      if (params?.type) filtered = filtered.filter((r) => r.type === params.type);
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((r) => r.targetName.toLowerCase().includes(q));
      }
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      return { data: filtered.slice(page * size, page * size + size), count: filtered.length };
    }
  },

  getReportById: async (id: string): Promise<Report> => {
    try {
      const res = await apiClient.get<{ data: Report }>(`/admin/reports/${id}`);
      return res.data;
    } catch {
      await delay(200);
      const report = MOCK_REPORTS.find((r) => r.id === id);
      if (!report) throw new Error('신고를 찾을 수 없습니다.');
      return report;
    }
  },

  getSanctions: async (
    params?: PaginationParams & ReportFilterParams
  ): Promise<GetSanctionsResponse> => {
    try {
      return await apiClient.get<GetSanctionsResponse>('/admin/sanctions', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      return {
        data: MOCK_SANCTIONS.slice(page * size, page * size + size),
        count: MOCK_SANCTIONS.length,
      };
    }
  },

  getReportStats: async (): Promise<ReportStats> => {
    try {
      return await apiClient.get<ReportStats>('/admin/reports/stats');
    } catch {
      await delay(200);
      return {
        total: MOCK_REPORTS.length,
        pending: MOCK_REPORTS.filter((r) => r.status === ReportStatus.PENDING).length,
        inReview: MOCK_REPORTS.filter((r) => r.status === ReportStatus.IN_REVIEW).length,
        processed: MOCK_REPORTS.filter((r) => r.status === ReportStatus.PROCESSED).length,
        dismissed: MOCK_REPORTS.filter((r) => r.status === ReportStatus.DISMISSED).length,
      };
    }
  },

  processReport: async (req: ProcessReportRequest): Promise<void> => {
    try {
      await apiClient.patch<void>(`/admin/reports/${req.reportId}/process`, {
        processingNote: req.processingNote,
        sanctionType: req.sanctionType,
      });
    } catch {
      await delay(300);
    }
  },

  dismissReport: async (reportId: string, note: string): Promise<void> => {
    try {
      await apiClient.patch<void>(`/admin/reports/${reportId}/dismiss`, { note });
    } catch {
      await delay(300);
    }
  },
};
