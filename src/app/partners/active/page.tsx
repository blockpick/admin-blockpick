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
import { usePartners, useSuspendPartner } from '@/lib/hooks/use-partners';
import { Partner, PartnerStatus } from '@/lib/types/partner';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Building2, ShieldOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ActivePartnersPage() {
  const [page, setPage] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading } = usePartners({ page, size: pageSize, status: PartnerStatus.ACTIVE });
  const suspendPartner = useSuspendPartner();

  const handleSuspend = async () => {
    if (!selectedPartner) return;
    try {
      await suspendPartner.mutateAsync({ partnerId: selectedPartner.id, reason: '정책 위반' });
      toast({ title: '파트너 정지 완료' });
      setSuspendOpen(false);
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
      accessorKey: 'category',
      header: '업종',
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
    },
    {
      accessorKey: 'totalGames',
      header: '총 게임 수',
      cell: ({ row }) => <span>{row.original.totalGames ?? 0}</span>,
    },
    {
      accessorKey: 'totalPlayers',
      header: '총 참여자',
      cell: ({ row }) => <span>{(row.original.totalPlayers ?? 0).toLocaleString()}명</span>,
    },
    {
      accessorKey: 'approvedAt',
      header: '승인일',
      cell: ({ row }) => row.original.approvedAt ? (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.approvedAt), { addSuffix: true })}
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
            <DropdownMenuItem onClick={() => { setSelectedPartner(row.original); setSuspendOpen(true); }}>
              <ShieldOff className="mr-2 h-4 w-4" /> 정지
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="운영 중 파트너" description="현재 활성 운영 중인 파트너 목록입니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={Building2} title="운영 중인 파트너가 없습니다" description="승인된 파트너가 없습니다" />
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
          open={suspendOpen}
          onOpenChange={(open) => { setSuspendOpen(open); if (!open) setSelectedPartner(null); }}
          title="파트너 정지"
          description={`"${selectedPartner?.companyName}"을(를) 정지하시겠습니까?`}
          confirmText="정지"
          cancelText="취소"
          onConfirm={handleSuspend}
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
}
