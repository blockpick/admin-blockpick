'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import { useReports, useReportStats, useProcessReport, useDismissReport } from '@/lib/hooks/use-reports';
import { Report, ReportStatus, ReportType, SanctionType } from '@/lib/types/report';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Flag, CheckCircle, XCircle, Search, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<ReportStatus, string> = {
  [ReportStatus.PENDING]: 'bg-yellow-500',
  [ReportStatus.IN_REVIEW]: 'bg-blue-500',
  [ReportStatus.PROCESSED]: 'bg-green-500',
  [ReportStatus.DISMISSED]: 'bg-gray-500',
};

const statusLabels: Record<ReportStatus, string> = {
  [ReportStatus.PENDING]: '처리 대기',
  [ReportStatus.IN_REVIEW]: '검토 중',
  [ReportStatus.PROCESSED]: '처리 완료',
  [ReportStatus.DISMISSED]: '기각',
};

const typeLabels: Record<ReportType, string> = {
  [ReportType.GAME]: '게임',
  [ReportType.USER]: '사용자',
  [ReportType.PARTNER]: '파트너',
  [ReportType.CONTENT]: '콘텐츠',
  [ReportType.OTHER]: '기타',
};

export default function ReportsPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<ReportType | undefined>();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogType, setDialogType] = useState<'process' | 'dismiss' | null>(null);
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading, error } = useReports({ page, size: pageSize, status: statusFilter, type: typeFilter, search: searchQuery || undefined });
  const { data: stats } = useReportStats();
  const processReport = useProcessReport();
  const dismissReport = useDismissReport();

  useEffect(() => { setPage(0); }, [searchQuery, statusFilter, typeFilter]);

  const handleConfirm = async () => {
    if (!selectedReport || !dialogType) return;
    try {
      if (dialogType === 'process') {
        await processReport.mutateAsync({ reportId: selectedReport.id, processingNote: '운영팀 검토 후 처리', sanctionType: SanctionType.WARNING });
        toast({ title: '신고 처리 완료' });
      } else {
        await dismissReport.mutateAsync({ reportId: selectedReport.id, note: '증거 불충분으로 기각' });
        toast({ title: '신고 기각 완료' });
      }
      setSelectedReport(null);
      setDialogType(null);
    } catch {
      toast({ title: '처리 실패', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'type',
      header: '유형',
      cell: ({ row }) => <Badge variant="outline">{typeLabels[row.original.type]}</Badge>,
    },
    {
      accessorKey: 'targetName',
      header: '신고 대상',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.targetName}</div>
          {row.original.reporterEmail && (
            <div className="text-sm text-muted-foreground">신고자: {row.original.reporterEmail}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: '신고 사유',
      cell: ({ row }) => <Badge variant="secondary">{row.original.reason}</Badge>,
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
            <span>{statusLabels[status]}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '신고일',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const report = row.original;
        if (report.status === ReportStatus.PROCESSED || report.status === ReportStatus.DISMISSED) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedReport(report); setDialogType('process'); }}>
                <CheckCircle className="mr-2 h-4 w-4" /> 처리
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedReport(report); setDialogType('dismiss'); }}>
                <XCircle className="mr-2 h-4 w-4" /> 기각
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="신고 / 제재" description="사용자 신고를 처리하고 제재를 관리합니다" />

        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="전체 신고" value={stats.total.toLocaleString()} icon={Flag} description="총 신고 건수" />
            <StatsCard title="처리 대기" value={stats.pending.toLocaleString()} icon={Flag} description="검토 필요" />
            <StatsCard title="처리 완료" value={stats.processed.toLocaleString()} icon={CheckCircle} description="완료된 신고" />
            <StatsCard title="기각" value={stats.dismissed.toLocaleString()} icon={XCircle} description="기각된 신고" />
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="신고 대상 검색..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={statusFilter ?? 'ALL'} onValueChange={(v) => setStatusFilter(v === 'ALL' ? undefined : v as ReportStatus)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="상태" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value={ReportStatus.PENDING}>처리 대기</SelectItem>
              <SelectItem value={ReportStatus.IN_REVIEW}>검토 중</SelectItem>
              <SelectItem value={ReportStatus.PROCESSED}>처리 완료</SelectItem>
              <SelectItem value={ReportStatus.DISMISSED}>기각</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter ?? 'ALL'} onValueChange={(v) => setTypeFilter(v === 'ALL' ? undefined : v as ReportType)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="유형" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 유형</SelectItem>
              <SelectItem value={ReportType.GAME}>게임</SelectItem>
              <SelectItem value={ReportType.USER}>사용자</SelectItem>
              <SelectItem value={ReportType.PARTNER}>파트너</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter || typeFilter) && (
            <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(''); setStatusFilter(undefined); setTypeFilter(undefined); }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLoading ? <LoadingSpinner /> : error ? (
          <EmptyState icon={Flag} title="신고 목록을 불러올 수 없습니다" description="잠시 후 다시 시도해주세요" />
        ) : data?.data.length === 0 ? (
          <EmptyState icon={Flag} title="신고가 없습니다" description="현재 처리할 신고가 없습니다" />
        ) : (
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            enableServerSidePagination
            pageCount={data ? Math.ceil(data.count / pageSize) : 0}
            onPaginationChange={setPage}
            initialPageSize={pageSize}
          />
        )}

        <ConfirmDialog
          open={!!dialogType}
          onOpenChange={(open) => { if (!open) { setSelectedReport(null); setDialogType(null); } }}
          title={dialogType === 'process' ? '신고 처리' : '신고 기각'}
          description={
            dialogType === 'process'
              ? `"${selectedReport?.targetName}" 신고를 처리하시겠습니까?`
              : `"${selectedReport?.targetName}" 신고를 기각하시겠습니까?`
          }
          confirmText={dialogType === 'process' ? '처리' : '기각'}
          cancelText="취소"
          onConfirm={handleConfirm}
          variant={dialogType === 'dismiss' ? 'destructive' : 'default'}
        />
      </div>
    </AdminLayout>
  );
}
