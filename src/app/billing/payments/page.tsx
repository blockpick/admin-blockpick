'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { useInvoices } from '@/lib/hooks/use-billing';
import { Invoice, PaymentStatus, PlanType } from '@/lib/types/billing';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.SUCCESS]: 'bg-green-500',
  [PaymentStatus.PENDING]: 'bg-yellow-500',
  [PaymentStatus.FAILED]: 'bg-red-500',
  [PaymentStatus.REFUNDED]: 'bg-gray-500',
};

const statusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.SUCCESS]: '성공',
  [PaymentStatus.PENDING]: '대기',
  [PaymentStatus.FAILED]: '실패',
  [PaymentStatus.REFUNDED]: '환불',
};

export default function PaymentsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { data, isLoading } = useInvoices({ page, size: pageSize });

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
      header: '결제 금액',
      cell: ({ row }) => <span className="font-medium">{row.original.amount.toLocaleString()}원</span>,
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
      accessorKey: 'billingPeriodStart',
      header: '결제 기간',
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.billingPeriodStart).toLocaleDateString('ko-KR')} ~{' '}
          {new Date(row.original.billingPeriodEnd).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      accessorKey: 'paidAt',
      header: '결제일',
      cell: ({ row }) => row.original.paidAt ? (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.paidAt), { addSuffix: true })}
        </span>
      ) : <span className="text-sm text-muted-foreground">-</span>,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="결제 상태" description="파트너사의 결제 현황을 확인합니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={CreditCard} title="결제 내역이 없습니다" description="결제 이력이 없습니다" />
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
