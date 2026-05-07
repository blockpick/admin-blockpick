'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSubscriptions, useBillingStats } from '@/lib/hooks/use-billing';
import { Subscription, SubscriptionStatus, PlanType, BillingFilterParams } from '@/lib/types/billing';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Search, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PaginationParams } from '@/lib/types/common';

const statusColors: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'bg-green-500',
  [SubscriptionStatus.TRIAL]: 'bg-blue-500',
  [SubscriptionStatus.PAST_DUE]: 'bg-red-500',
  [SubscriptionStatus.CANCELED]: 'bg-gray-500',
  [SubscriptionStatus.EXPIRED]: 'bg-gray-400',
};

const statusLabels: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: '활성',
  [SubscriptionStatus.TRIAL]: '체험',
  [SubscriptionStatus.PAST_DUE]: '연체',
  [SubscriptionStatus.CANCELED]: '해지',
  [SubscriptionStatus.EXPIRED]: '만료',
};

const planColors: Record<PlanType, string> = {
  [PlanType.FREE]: 'secondary',
  [PlanType.STARTER]: 'outline',
  [PlanType.GROWTH]: 'outline',
  [PlanType.PRO]: 'default',
  [PlanType.ENTERPRISE]: 'default',
} as const;

export default function BillingPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | undefined>();
  const pageSize = 10;

  const params: PaginationParams & BillingFilterParams = {
    page,
    size: pageSize,
    search: searchQuery || undefined,
    status: statusFilter,
  };

  const { data, isLoading, error } = useSubscriptions(params);
  const { data: stats } = useBillingStats();

  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: 'partnerName',
      header: '파트너사',
      cell: ({ row }) => <div className="font-medium">{row.original.partnerName}</div>,
    },
    {
      accessorKey: 'planType',
      header: '플랜',
      cell: ({ row }) => (
        <Badge variant={planColors[row.original.planType] as 'default' | 'secondary' | 'outline'}>
          {row.original.planType}
        </Badge>
      ),
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
      accessorKey: 'monthlyAmount',
      header: '월 결제액',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.monthlyAmount.toLocaleString()}원</span>
      ),
    },
    {
      accessorKey: 'billingCycle',
      header: '결제 주기',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.billingCycle === 'MONTHLY' ? '월간' : '연간'}</Badge>
      ),
    },
    {
      accessorKey: 'nextBillingDate',
      header: '다음 결제일',
      cell: ({ row }) => row.original.nextBillingDate
        ? <span className="text-sm">{new Date(row.original.nextBillingDate).toLocaleDateString('ko-KR')}</span>
        : <span className="text-sm text-muted-foreground">-</span>,
    },
    {
      accessorKey: 'createdAt',
      header: '구독 시작',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="과금 / 구독 관리" description="파트너사의 구독 현황과 결제를 관리합니다" />

        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="활성 구독" value={stats.activeSubscriptions.toLocaleString()} icon={CreditCard} description="활성 구독 수" />
            <StatsCard title="총 매출" value={`${stats.totalRevenue.toLocaleString()}원`} icon={CreditCard} description="이번 달 매출" />
            <StatsCard title="연체" value={stats.pastDueCount.toLocaleString()} icon={CreditCard} description="결제 연체 건수" />
            <StatsCard title="체험판" value={stats.trialCount.toLocaleString()} icon={CreditCard} description="체험 중인 파트너" />
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="파트너사 검색..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={statusFilter ?? 'ALL'} onValueChange={(v) => setStatusFilter(v === 'ALL' ? undefined : v as SubscriptionStatus)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="상태" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value={SubscriptionStatus.ACTIVE}>활성</SelectItem>
              <SelectItem value={SubscriptionStatus.TRIAL}>체험</SelectItem>
              <SelectItem value={SubscriptionStatus.PAST_DUE}>연체</SelectItem>
              <SelectItem value={SubscriptionStatus.CANCELED}>해지</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter) && (
            <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(''); setStatusFilter(undefined); }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLoading ? <LoadingSpinner /> : error ? (
          <EmptyState icon={CreditCard} title="구독 목록을 불러올 수 없습니다" description="잠시 후 다시 시도해주세요" />
        ) : data?.data.length === 0 ? (
          <EmptyState icon={CreditCard} title="구독이 없습니다" description="등록된 구독이 없습니다" />
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
