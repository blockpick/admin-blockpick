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
import { usePartners, useApprovePartner, useRejectPartner } from '@/lib/hooks/use-partners';
import { Partner, PartnerStatus } from '@/lib/types/partner';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Building2, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function PendingPartnersPage() {
  const [page, setPage] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading } = usePartners({ page, size: pageSize, status: PartnerStatus.PENDING });
  const approvePartner = useApprovePartner();
  const rejectPartner = useRejectPartner();

  const handleConfirm = async () => {
    if (!selectedPartner || !dialogType) return;
    try {
      if (dialogType === 'approve') {
        await approvePartner.mutateAsync({ partnerId: selectedPartner.id });
        toast({ title: '파트너 승인 완료' });
      } else {
        await rejectPartner.mutateAsync({ partnerId: selectedPartner.id, reason: '운영 정책 미부합' });
        toast({ title: '파트너 거부 완료' });
      }
      setSelectedPartner(null);
      setDialogType(null);
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
      accessorKey: 'createdAt',
      header: '신청일',
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
            <DropdownMenuItem onClick={() => { setSelectedPartner(row.original); setDialogType('approve'); }}>
              <CheckCircle className="mr-2 h-4 w-4" /> 승인
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedPartner(row.original); setDialogType('reject'); }}>
              <XCircle className="mr-2 h-4 w-4" /> 거부
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="승인 대기 파트너" description="승인을 기다리는 파트너 신청을 검토합니다" />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={Building2} title="승인 대기 중인 파트너가 없습니다" description="모든 파트너 신청이 처리되었습니다" />
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
          onOpenChange={(open) => { if (!open) { setSelectedPartner(null); setDialogType(null); } }}
          title={dialogType === 'approve' ? '파트너 승인' : '파트너 거부'}
          description={
            dialogType === 'approve'
              ? `"${selectedPartner?.companyName}"을(를) 승인하시겠습니까?`
              : `"${selectedPartner?.companyName}"을(를) 거부하시겠습니까?`
          }
          confirmText={dialogType === 'approve' ? '승인' : '거부'}
          cancelText="취소"
          onConfirm={handleConfirm}
          variant={dialogType === 'reject' ? 'destructive' : 'default'}
        />
      </div>
    </AdminLayout>
  );
}
