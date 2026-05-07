'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import { useReports, useProcessReport, useDismissReport } from '@/lib/hooks/use-reports';
import { Report, ReportStatus, ReportType, SanctionType } from '@/lib/types/report';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Flag, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const typeLabels: Record<ReportType, string> = {
  [ReportType.GAME]: '게임',
  [ReportType.USER]: '사용자',
  [ReportType.PARTNER]: '파트너',
  [ReportType.CONTENT]: '콘텐츠',
  [ReportType.OTHER]: '기타',
};

export default function PendingReportsPage() {
  const [page, setPage] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogType, setDialogType] = useState<'process' | 'dismiss' | null>(null);
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading } = useReports({ page, size: pageSize, status: ReportStatus.PENDING });
  const processReport = useProcessReport();
  const dismissReport = useDismissReport();

  const handleConfirm = async () => {
    if (!selectedReport || !dialogType) return;
    try {
      if (dialogType === 'process') {
        await processReport.mutateAsync({ reportId: selectedReport.id, processingNote: '처리 완료', sanctionType: SanctionType.WARNING });
        toast({ title: '신고 처리 완료' });
      } else {
        await dismissReport.mutateAsync({ reportId: selectedReport.id, note: '기각 처리' });
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
      accessorKey: 'description',
      header: '내용',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2">{row.original.description ?? '-'}</span>
      ),
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
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedReport(row.original); setDialogType('process'); }}>
              <CheckCircle className="mr-2 h-4 w-4" /> 처리
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedReport(row.original); setDialogType('dismiss'); }}>
              <XCircle className="mr-2 h-4 w-4" /> 기각
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="처리 대기 신고" description="아직 처리되지 않은 신고 목록입니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={Flag} title="처리 대기 중인 신고가 없습니다" description="모든 신고가 처리되었습니다" />
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
          description={dialogType === 'process' ? `"${selectedReport?.targetName}" 신고를 처리하시겠습니까?` : `"${selectedReport?.targetName}" 신고를 기각하시겠습니까?`}
          confirmText={dialogType === 'process' ? '처리' : '기각'}
          cancelText="취소"
          onConfirm={handleConfirm}
          variant={dialogType === 'dismiss' ? 'destructive' : 'default'}
        />
      </div>
    </AdminLayout>
  );
}
