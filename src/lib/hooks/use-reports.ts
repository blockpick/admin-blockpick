/**
 * 신고/제재 hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../api/report.service';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';
import type { ReportFilterParams, ProcessReportRequest } from '../types/report';
import type { PaginationParams } from '../types/common';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (params?: PaginationParams & ReportFilterParams) => [...reportKeys.lists(), params] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  sanctions: () => [...reportKeys.all, 'sanctions'] as const,
  sanctionList: (params?: PaginationParams & ReportFilterParams) => [...reportKeys.sanctions(), params] as const,
  stats: () => [...reportKeys.all, 'stats'] as const,
};

export function useReports(params?: PaginationParams & ReportFilterParams) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => reportService.getReports(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportService.getReportById(id),
    enabled: shouldEnableQueryWith(!!id),
  });
}

export function useSanctions(params?: PaginationParams & ReportFilterParams) {
  return useQuery({
    queryKey: reportKeys.sanctionList(params),
    queryFn: () => reportService.getSanctions(params),
    placeholderData: (prev) => prev,
    enabled: shouldEnableQuery(),
  });
}

export function useReportStats() {
  return useQuery({
    queryKey: reportKeys.stats(),
    queryFn: () => reportService.getReportStats(),
    enabled: shouldEnableQuery(),
  });
}

export function useProcessReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: ProcessReportRequest) => reportService.processReport(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportKeys.stats() });
    },
  });
}

export function useDismissReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, note }: { reportId: string; note: string }) =>
      reportService.dismissReport(reportId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportKeys.stats() });
    },
  });
}
