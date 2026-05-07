'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { useReports } from '@/lib/hooks/use-reports';
import { Report, ReportStatus, ReportType } from '@/lib/types/report';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeLabels: Record<ReportType, string> = {
  [ReportType.GAME]: '게임',
  [ReportType.USER]: '사용자',
  [ReportType.PARTNER]: '파트너',
  [ReportType.CONTENT]: '콘텐츠',
  [ReportType.OTHER]: '기타',
};

export default function ProcessedReportsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { data, isLoading } = useReports({ page, size: pageSize, status: ReportStatus.PROCESSED });

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'type',
      header: '유형',
      cell: ({ row }) => <Badge variant="outline">{typeLabels[row.original.type]}</Badge>,
    },
    {
      accessorKey: 'targetName',
      header: '신고 대상',
      cell: ({ row }) => <div className="font-medium">{row.original.targetName}</div>,
    },
    {
      accessorKey: 'reason',
      header: '신고 사유',
      cell: ({ row }) => <Badge variant="secondary">{row.original.reason}</Badge>,
    },
    {
      accessorKey: 'sanctionApplied',
      header: '적용된 제재',
      cell: ({ row }) => row.original.sanctionApplied
        ? <Badge>{row.original.sanctionApplied}</Badge>
        : <span className="text-sm text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'processedBy',
      header: '처리자',
      cell: ({ row }) => <span className="text-sm">{row.original.processedBy ?? '-'}</span>,
    },
    {
      accessorKey: 'processedAt',
      header: '처리일',
      cell: ({ row }) => row.original.processedAt ? (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.processedAt), { addSuffix: true })}
        </span>
      ) : <span className="text-sm text-muted-foreground">-</span>,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="처리 완료 신고" description="처리가 완료된 신고 이력입니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={CheckCircle} title="처리 완료된 신고가 없습니다" description="처리된 신고 이력이 없습니다" />
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
      </div>
    </AdminLayout>
  );
}
