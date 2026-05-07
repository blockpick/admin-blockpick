'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { useFailedPayments } from '@/lib/hooks/use-billing';
import { Invoice } from '@/lib/types/billing';
import { ColumnDef } from '@tanstack/react-table';
import { AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function FailuresPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { data, isLoading } = useFailedPayments({ page, size: pageSize });

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'partnerName',
      header: '파트너사',
      cell: ({ row }) => <div className="font-medium">{row.original.partnerName}</div>,
    },
    {
      accessorKey: 'planType',
      header: '플랜',
      cell: ({ row }) => <Badge variant="outline">{row.original.planType}</Badge>,
    },
    {
      accessorKey: 'amount',
      header: '미결제 금액',
      cell: ({ row }) => <span className="font-medium text-red-600">{row.original.amount.toLocaleString()}원</span>,
    },
    {
      accessorKey: 'failureReason',
      header: '실패 사유',
      cell: ({ row }) => (
        <span className="text-sm text-red-500">{row.original.failureReason ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'failedAt',
      header: '실패일',
      cell: ({ row }) => row.original.failedAt ? (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.failedAt), { addSuffix: true })}
        </span>
      ) : <span className="text-sm text-muted-foreground">-</span>,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="결제 실패 / 연체" description="결제 실패 및 연체 현황을 관리합니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={AlertCircle} title="결제 실패 내역이 없습니다" description="모든 결제가 정상 처리되었습니다" />
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
