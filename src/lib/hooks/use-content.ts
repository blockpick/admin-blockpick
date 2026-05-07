/**
 * 콘텐츠/정책 hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contentService } from '../api/content.service';
import { shouldEnableQuery } from './query-utils';
import type { Notice, Faq, Terms, OperationPolicy, Banner, ContentFilterParams } from '../types/content';
import type { PaginationParams } from '../types/common';

export const contentKeys = {
  all: ['content'] as const,
  notices: () => [...contentKeys.all, 'notices'] as const,
  noticeList: (params?: PaginationParams & ContentFilterParams) => [...contentKeys.notices(), params] as const,
  faqs: () => [...contentKeys.all, 'faqs'] as const,
  faqList: (params?: PaginationParams & ContentFilterParams) => [...contentKeys.faqs(), params] as const,
  terms: () => [...contentKeys.all, 'terms'] as const,
  operations: () => [...contentKeys.all, 'operations'] as const,
  operationList: (params?: PaginationParams & ContentFilterParams) => [...contentKeys.operations(), params] as const,
  banners: () => [...contentKeys.all, 'banners'] as const,
  bannerList: (params?: PaginationParams & ContentFilterParams) => [...contentKeys.banners(), params] as const,
};

// 공지사항
export function useNotices(params?: PaginationParams & ContentFilterParams) {
  return useQuery({
    queryKey: contentKeys.noticeList(params),
    queryFn: () => contentService.getNotices(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Notice>) => contentService.createNotice(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.notices() }); },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Notice> }) =>
      contentService.updateNotice(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.notices() }); },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deleteNotice(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.notices() }); },
  });
}

// FAQ
export function useFaqs(params?: PaginationParams & ContentFilterParams) {
  return useQuery({
    queryKey: contentKeys.faqList(params),
    queryFn: () => contentService.getFaqs(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Faq>) => contentService.createFaq(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.faqs() }); },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Faq> }) =>
      contentService.updateFaq(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.faqs() }); },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deleteFaq(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.faqs() }); },
  });
}

// 약관
export function useTerms(params?: PaginationParams) {
  return useQuery({
    queryKey: [...contentKeys.terms(), params],
    queryFn: () => contentService.getTerms(params),
    enabled: shouldEnableQuery(),
  });
}

export function useCreateTerms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Terms>) => contentService.createTerms(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.terms() }); },
  });
}

// 운영 정책
export function useOperationPolicies(params?: PaginationParams & ContentFilterParams) {
  return useQuery({
    queryKey: contentKeys.operationList(params),
    queryFn: () => contentService.getOperationPolicies(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useCreateOperationPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OperationPolicy>) => contentService.createOperationPolicy(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.operations() }); },
  });
}

export function useUpdateOperationPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OperationPolicy> }) =>
      contentService.updateOperationPolicy(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.operations() }); },
  });
}

export function useDeleteOperationPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deleteOperationPolicy(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.operations() }); },
  });
}

// 배너
export function useBanners(params?: PaginationParams & ContentFilterParams) {
  return useQuery({
    queryKey: contentKeys.bannerList(params),
    queryFn: () => contentService.getBanners(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Banner>) => contentService.createBanner(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.banners() }); },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Banner> }) =>
      contentService.updateBanner(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.banners() }); },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deleteBanner(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: contentKeys.banners() }); },
  });
}
