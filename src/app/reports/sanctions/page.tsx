'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { useSanctions } from '@/lib/hooks/use-reports';
import { Sanction, ReportType, SanctionType } from '@/lib/types/report';
import { ColumnDef } from '@tanstack/react-table';
import { ShieldOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeLabels: Record<ReportType, string> = {
  [ReportType.GAME]: '게임',
  [ReportType.USER]: '사용자',
  [ReportType.PARTNER]: '파트너',
  [ReportType.CONTENT]: '콘텐츠',
  [ReportType.OTHER]: '기타',
};

const sanctionLabels: Record<SanctionType, string> = {
  [SanctionType.WARNING]: '경고',
  [SanctionType.SUSPEND_7]: '7일 정지',
  [SanctionType.SUSPEND_30]: '30일 정지',
  [SanctionType.PERMANENT_BAN]: '영구 차단',
  [SanctionType.CONTENT_REMOVAL]: '콘텐츠 삭제',
  [SanctionType.FORCE_END]: '강제 종료',
};

export default function SanctionsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { data, isLoading } = useSanctions({ page, size: pageSize });

  const columns: ColumnDef<Sanction>[] = [
    {
      accessorKey: 'targetType',
      header: '대상 유형',
      cell: ({ row }) => <Badge variant="outline">{typeLabels[row.original.targetType]}</Badge>,
    },
    {
      accessorKey: 'targetName',
      header: '제재 대상',
      cell: ({ row }) => <div className="font-medium">{row.original.targetName}</div>,
    },
    {
      accessorKey: 'sanctionType',
      header: '제재 유형',
      cell: ({ row }) => (
        <Badge variant={row.original.sanctionType === SanctionType.PERMANENT_BAN ? 'destructive' : 'secondary'}>
          {sanctionLabels[row.original.sanctionType]}
        </Badge>
      ),
    },
    {
      accessorKey: 'reason',
      header: '제재 사유',
      cell: ({ row }) => <span className="text-sm">{row.original.reason}</span>,
    },
    {
      accessorKey: 'isActive',
      header: '활성 여부',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${row.original.isActive ? 'bg-red-500' : 'bg-gray-400'}`} />
          <span>{row.original.isActive ? '활성' : '만료'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'appliedBy',
      header: '처리자',
      cell: ({ row }) => <span className="text-sm">{row.original.appliedBy}</span>,
    },
    {
      accessorKey: 'appliedAt',
      header: '제재일',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.appliedAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      accessorKey: 'expiresAt',
      header: '만료일',
      cell: ({ row }) => row.original.expiresAt
        ? <span className="text-sm">{new Date(row.original.expiresAt).toLocaleDateString('ko-KR')}</span>
        : <span className="text-sm text-muted-foreground">영구</span>,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="제재 이력" description="적용된 모든 제재 내역을 확인합니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={ShieldOff} title="제재 이력이 없습니다" description="적용된 제재가 없습니다" />
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
