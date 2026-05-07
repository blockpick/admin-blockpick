'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUsageStats } from '@/lib/hooks/use-billing';
import { UsageStat } from '@/lib/types/billing';
import { ColumnDef } from '@tanstack/react-table';
import { BarChart3 } from 'lucide-react';

export default function UsagePage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const { data, isLoading } = useUsageStats({ page, size: pageSize });

  const columns: ColumnDef<UsageStat>[] = [
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
      accessorKey: 'activeGames',
      header: '게임 사용량',
      cell: ({ row }) => {
        const pct = Math.round((row.original.activeGames / row.original.maxGames) * 100);
        return (
          <div className="space-y-1 w-32">
            <div className="flex justify-between text-xs">
              <span>{row.original.activeGames}/{row.original.maxGames}</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        );
      },
    },
    {
      accessorKey: 'totalPlayers',
      header: '참여자 사용량',
      cell: ({ row }) => {
        const pct = Math.round((row.original.totalPlayers / row.original.maxPlayers) * 100);
        return (
          <div className="space-y-1 w-32">
            <div className="flex justify-between text-xs">
              <span>{row.original.totalPlayers.toLocaleString()}/{row.original.maxPlayers.toLocaleString()}</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        );
      },
    },
    {
      accessorKey: 'storageUsedMb',
      header: '스토리지',
      cell: ({ row }) => {
        const pct = Math.round((row.original.storageUsedMb / row.original.maxStorageMb) * 100);
        return (
          <div className="space-y-1 w-32">
            <div className="flex justify-between text-xs">
              <span>{row.original.storageUsedMb}MB/{row.original.maxStorageMb}MB</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        );
      },
    },
    {
      accessorKey: 'period',
      header: '기준 기간',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.period}</span>,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="사용량 현황" description="파트너사별 플랜 사용량을 확인합니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={BarChart3} title="사용량 데이터가 없습니다" description="백엔드 연동 후 데이터가 표시됩니다" />
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
