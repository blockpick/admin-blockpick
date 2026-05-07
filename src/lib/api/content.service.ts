/**
 * 콘텐츠/정책 API Service
 * 백엔드 미구현 endpoint는 mock fallback 반환
 */

import { apiClient } from './client';
import type {
  Notice,
  Faq,
  Terms,
  OperationPolicy,
  Banner,
  ContentFilterParams,
} from '../types/content';
import {
  NoticeStatus,
  NoticeCategory,
  TermsType,
  BannerPosition,
  BannerStatus,
} from '../types/content';
import type { PaginationParams } from '../types/common';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: '[공지] 블록픽 서비스 업데이트 안내',
    content: '안녕하세요. 블록픽 서비스 업데이트 내용을 안내드립니다.',
    category: NoticeCategory.UPDATE,
    status: NoticeStatus.PUBLISHED,
    isPinned: true,
    viewCount: 1234,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin@blockpick.net',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '[이벤트] 5월 특별 이벤트',
    content: '5월 특별 이벤트에 참여하세요!',
    category: NoticeCategory.EVENT,
    status: NoticeStatus.PUBLISHED,
    isPinned: false,
    viewCount: 567,
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin@blockpick.net',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_FAQS: Faq[] = [
  {
    id: '1',
    question: '블록픽은 어떻게 이용하나요?',
    answer: '블록픽 앱을 다운로드한 후 회원가입을 진행하면 바로 이용할 수 있습니다.',
    isPublished: true,
    viewCount: 890,
    sortOrder: 1,
    createdBy: 'admin@blockpick.net',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    question: '포인트는 어떻게 사용하나요?',
    answer: '적립된 포인트는 게임 참여 및 상품 교환에 사용할 수 있습니다.',
    isPublished: true,
    viewCount: 654,
    sortOrder: 2,
    createdBy: 'admin@blockpick.net',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_TERMS: Terms[] = [
  {
    id: '1',
    type: TermsType.SERVICE,
    version: '1.2',
    title: '서비스 이용약관',
    content: '블록픽 서비스 이용약관 내용입니다.',
    isActive: true,
    effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin@blockpick.net',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: TermsType.PRIVACY,
    version: '1.1',
    title: '개인정보 처리방침',
    content: '블록픽 개인정보 처리방침 내용입니다.',
    isActive: true,
    effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin@blockpick.net',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    title: '5월 이벤트 배너',
    imageUrl: 'https://placehold.co/800x200',
    linkUrl: '/events/may',
    position: BannerPosition.HOME_TOP,
    status: BannerStatus.ACTIVE,
    sortOrder: 1,
    clickCount: 345,
    impressionCount: 12000,
    createdBy: 'admin@blockpick.net',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface GetNoticesResponse { data: Notice[]; count: number; }
export interface GetFaqsResponse { data: Faq[]; count: number; }
export interface GetTermsResponse { data: Terms[]; count: number; }
export interface GetOperationPoliciesResponse { data: OperationPolicy[]; count: number; }
export interface GetBannersResponse { data: Banner[]; count: number; }

export const contentService = {
  // 공지사항
  getNotices: async (params?: PaginationParams & ContentFilterParams): Promise<GetNoticesResponse> => {
    try {
      return await apiClient.get<GetNoticesResponse>('/admin/content/notices', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      let filtered = [...MOCK_NOTICES];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((n) => n.title.toLowerCase().includes(q));
      }
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      return { data: filtered.slice(page * size, page * size + size), count: filtered.length };
    }
  },

  createNotice: async (data: Partial<Notice>): Promise<Notice> => {
    try {
      const res = await apiClient.post<{ data: Notice }>('/admin/content/notices', data);
      return res.data;
    } catch {
      await delay(300);
      return { id: String(Date.now()), ...data } as Notice;
    }
  },

  updateNotice: async (id: string, data: Partial<Notice>): Promise<void> => {
    try {
      await apiClient.put<void>(`/admin/content/notices/${id}`, data);
    } catch {
      await delay(300);
    }
  },

  deleteNotice: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/admin/content/notices/${id}`);
    } catch {
      await delay(300);
    }
  },

  // FAQ
  getFaqs: async (params?: PaginationParams & ContentFilterParams): Promise<GetFaqsResponse> => {
    try {
      return await apiClient.get<GetFaqsResponse>('/admin/content/faqs', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      return { data: MOCK_FAQS.slice(page * size, page * size + size), count: MOCK_FAQS.length };
    }
  },

  createFaq: async (data: Partial<Faq>): Promise<Faq> => {
    try {
      const res = await apiClient.post<{ data: Faq }>('/admin/content/faqs', data);
      return res.data;
    } catch {
      await delay(300);
      return { id: String(Date.now()), ...data } as Faq;
    }
  },

  updateFaq: async (id: string, data: Partial<Faq>): Promise<void> => {
    try {
      await apiClient.put<void>(`/admin/content/faqs/${id}`, data);
    } catch {
      await delay(300);
    }
  },

  deleteFaq: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/admin/content/faqs/${id}`);
    } catch {
      await delay(300);
    }
  },

  // 약관
  getTerms: async (params?: PaginationParams): Promise<GetTermsResponse> => {
    try {
      return await apiClient.get<GetTermsResponse>('/admin/content/terms', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      return { data: MOCK_TERMS, count: MOCK_TERMS.length };
    }
  },

  createTerms: async (data: Partial<Terms>): Promise<Terms> => {
    try {
      const res = await apiClient.post<{ data: Terms }>('/admin/content/terms', data);
      return res.data;
    } catch {
      await delay(300);
      return { id: String(Date.now()), ...data } as Terms;
    }
  },

  // 운영 정책
  getOperationPolicies: async (params?: PaginationParams & ContentFilterParams): Promise<GetOperationPoliciesResponse> => {
    try {
      return await apiClient.get<GetOperationPoliciesResponse>('/admin/content/policies', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      return { data: [], count: 0 };
    }
  },

  createOperationPolicy: async (data: Partial<OperationPolicy>): Promise<OperationPolicy> => {
    try {
      const res = await apiClient.post<{ data: OperationPolicy }>('/admin/content/policies', data);
      return res.data;
    } catch {
      await delay(300);
      return { id: String(Date.now()), ...data } as OperationPolicy;
    }
  },

  updateOperationPolicy: async (id: string, data: Partial<OperationPolicy>): Promise<void> => {
    try {
      await apiClient.put<void>(`/admin/content/policies/${id}`, data);
    } catch {
      await delay(300);
    }
  },

  deleteOperationPolicy: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/admin/content/policies/${id}`);
    } catch {
      await delay(300);
    }
  },

  // 배너
  getBanners: async (params?: PaginationParams & ContentFilterParams): Promise<GetBannersResponse> => {
    try {
      return await apiClient.get<GetBannersResponse>('/admin/content/banners', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    } catch {
      await delay(300);
      const page = params?.page ?? 0;
      const size = params?.size ?? 10;
      return { data: MOCK_BANNERS.slice(page * size, page * size + size), count: MOCK_BANNERS.length };
    }
  },

  createBanner: async (data: Partial<Banner>): Promise<Banner> => {
    try {
      const res = await apiClient.post<{ data: Banner }>('/admin/content/banners', data);
      return res.data;
    } catch {
      await delay(300);
      return { id: String(Date.now()), ...data } as Banner;
    }
  },

  updateBanner: async (id: string, data: Partial<Banner>): Promise<void> => {
    try {
      await apiClient.put<void>(`/admin/content/banners/${id}`, data);
    } catch {
      await delay(300);
    }
  },

  deleteBanner: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<void>(`/admin/content/banners/${id}`);
    } catch {
      await delay(300);
    }
  },
};
