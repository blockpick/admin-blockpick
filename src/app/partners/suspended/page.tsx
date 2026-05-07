'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import { usePartners, useUnsuspendPartner } from '@/lib/hooks/use-partners';
import { Partner, PartnerStatus } from '@/lib/types/partner';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Building2, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function SuspendedPartnersPage() {
  const [page, setPage] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [unsuspendOpen, setUnsuspendOpen] = useState(false);
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading } = usePartners({ page, size: pageSize, status: PartnerStatus.SUSPENDED });
  const unsuspendPartner = useUnsuspendPartner();

  const handleUnsuspend = async () => {
    if (!selectedPartner) return;
    try {
      await unsuspendPartner.mutateAsync(selectedPartner.id);
      toast({ title: '파트너 정지 해제 완료' });
      setUnsuspendOpen(false);
      setSelectedPartner(null);
    } catch {
      toast({ title: '처리 실패', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Partner>[] = [
    {
      accessorKey: 'companyName',
      header: '파트너사',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.companyName}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    { accessorKey: 'representativeName', header: '대표자' },
    {
      accessorKey: 'suspendedReason',
      header: '정지 사유',
      cell: ({ row }) => (
        <span className="text-sm text-red-600">{row.original.suspendedReason ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'suspendedAt',
      header: '정지일',
      cell: ({ row }) => row.original.suspendedAt ? (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.suspendedAt), { addSuffix: true })}
        </span>
      ) : <span className="text-sm text-muted-foreground">-</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedPartner(row.original); setUnsuspendOpen(true); }}>
              <Shield className="mr-2 h-4 w-4" /> 정지 해제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="정지 / 제재 파트너" description="현재 정지된 파트너 목록입니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={Building2} title="정지된 파트너가 없습니다" description="현재 정지된 파트너가 없습니다" />
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
          open={unsuspendOpen}
          onOpenChange={(open) => { setUnsuspendOpen(open); if (!open) setSelectedPartner(null); }}
          title="파트너 정지 해제"
          description={`"${selectedPartner?.companyName}" 정지를 해제하시겠습니까?`}
          confirmText="해제"
          cancelText="취소"
          onConfirm={handleUnsuspend}
        />
      </div>
    </AdminLayout>
  );
}
