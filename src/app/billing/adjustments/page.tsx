'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdjustments } from '@/lib/hooks/use-billing';
import { BillingAdjustment } from '@/lib/types/billing';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdjustmentsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { data, isLoading } = useAdjustments({ page, size: pageSize });

  const columns: ColumnDef<BillingAdjustment>[] = [
    {
      accessorKey: 'partnerName',
      header: '파트너사',
      cell: ({ row }) => <div className="font-medium">{row.original.partnerName}</div>,
    },
    {
      accessorKey: 'adjustmentType',
      header: '유형',
      cell: ({ row }) => (
        <Badge variant={row.original.adjustmentType === 'CREDIT' ? 'default' : 'destructive'}>
          {row.original.adjustmentType === 'CREDIT' ? '크레딧' : '차감'}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: '금액',
      cell: ({ row }) => (
        <span className={`font-medium ${row.original.adjustmentType === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
          {row.original.adjustmentType === 'CREDIT' ? '+' : '-'}{row.original.amount.toLocaleString()}원
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: '사유',
      cell: ({ row }) => <span className="text-sm">{row.original.reason}</span>,
    },
    {
      accessorKey: 'appliedBy',
      header: '처리자',
      cell: ({ row }) => <span className="text-sm">{row.original.appliedBy}</span>,
    },
    {
      accessorKey: 'appliedAt',
      header: '처리일',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.appliedAt), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="수동 조정 이력"
          description="관리자가 수동으로 처리한 과금 조정 내역입니다"
          action={{ label: '수동 조정 추가', icon: Plus, onClick: () => {} }}
        />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={Settings} title="수동 조정 이력이 없습니다" description="수동 조정된 내역이 없습니다" />
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
