'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import {
  usePartners,
  usePartnerStats,
  useApprovePartner,
  useRejectPartner,
  useSuspendPartner,
  useUnsuspendPartner,
} from '@/lib/hooks/use-partners';
import { Partner, PartnerStatus } from '@/lib/types/partner';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Building2,
  CheckCircle,
  XCircle,
  ShieldOff,
  Shield,
  Search,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<PartnerStatus, string> = {
  [PartnerStatus.PENDING]: 'bg-yellow-500',
  [PartnerStatus.ACTIVE]: 'bg-green-500',
  [PartnerStatus.SUSPENDED]: 'bg-red-500',
  [PartnerStatus.REJECTED]: 'bg-gray-500',
};

const statusLabels: Record<PartnerStatus, string> = {
  [PartnerStatus.PENDING]: '승인 대기',
  [PartnerStatus.ACTIVE]: '운영 중',
  [PartnerStatus.SUSPENDED]: '정지',
  [PartnerStatus.REJECTED]: '거부됨',
};

export default function PartnersPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | undefined>();
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | 'suspend' | 'unsuspend' | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading, error } = usePartners({ page, size: pageSize, status: statusFilter, search: searchQuery || undefined });
  const { data: stats } = usePartnerStats();
  const approvePartner = useApprovePartner();
  const rejectPartner = useRejectPartner();
  const suspendPartner = useSuspendPartner();
  const unsuspendPartner = useUnsuspendPartner();

  useEffect(() => { setPage(0); }, [searchQuery, statusFilter]);

  const openDialog = (partner: Partner, type: typeof dialogType) => {
    setSelectedPartner(partner);
    setDialogType(type);
  };

  const closeDialog = () => {
    setSelectedPartner(null);
    setDialogType(null);
    setSuspendReason('');
  };

  const handleConfirm = async () => {
    if (!selectedPartner || !dialogType) return;
    try {
      if (dialogType === 'approve') {
        await approvePartner.mutateAsync({ partnerId: selectedPartner.id });
        toast({ title: '파트너 승인 완료' });
      } else if (dialogType === 'reject') {
        await rejectPartner.mutateAsync({ partnerId: selectedPartner.id, reason: '운영 정책 미부합' });
        toast({ title: '파트너 거부 완료' });
      } else if (dialogType === 'suspend') {
        await suspendPartner.mutateAsync({ partnerId: selectedPartner.id, reason: suspendReason || '정책 위반' });
        toast({ title: '파트너 정지 완료' });
      } else if (dialogType === 'unsuspend') {
        await unsuspendPartner.mutateAsync(selectedPartner.id);
        toast({ title: '파트너 정지 해제 완료' });
      }
      closeDialog();
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
    {
      accessorKey: 'representativeName',
      header: '대표자',
    },
    {
      accessorKey: 'category',
      header: '업종',
      cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
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
      cell: ({ row }) => {
        const partner = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {partner.status === PartnerStatus.PENDING && (
                <>
                  <DropdownMenuItem onClick={() => openDialog(partner, 'approve')}>
                    <CheckCircle className="mr-2 h-4 w-4" /> 승인
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDialog(partner, 'reject')}>
                    <XCircle className="mr-2 h-4 w-4" /> 거부
                  </DropdownMenuItem>
                </>
              )}
              {partner.status === PartnerStatus.ACTIVE && (
                <DropdownMenuItem onClick={() => openDialog(partner, 'suspend')}>
                  <ShieldOff className="mr-2 h-4 w-4" /> 정지
                </DropdownMenuItem>
              )}
              {partner.status === PartnerStatus.SUSPENDED && (
                <DropdownMenuItem onClick={() => openDialog(partner, 'unsuspend')}>
                  <Shield className="mr-2 h-4 w-4" /> 정지 해제
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="파트너 관리" description="파트너사를 검수하고 상태를 관리합니다" />

        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="전체 파트너" value={stats.total.toLocaleString()} icon={Building2} description="총 등록 파트너" />
            <StatsCard title="승인 대기" value={stats.pending.toLocaleString()} icon={Building2} description="검토 필요" />
            <StatsCard title="운영 중" value={stats.active.toLocaleString()} icon={CheckCircle} description="활성 파트너" />
            <StatsCard title="정지" value={stats.suspended.toLocaleString()} icon={ShieldOff} description="제재 파트너" />
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="파트너사명, 이메일 검색..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={statusFilter ?? 'ALL'} onValueChange={(v) => setStatusFilter(v === 'ALL' ? undefined : v as PartnerStatus)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="상태" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value={PartnerStatus.PENDING}>승인 대기</SelectItem>
              <SelectItem value={PartnerStatus.ACTIVE}>운영 중</SelectItem>
              <SelectItem value={PartnerStatus.SUSPENDED}>정지</SelectItem>
              <SelectItem value={PartnerStatus.REJECTED}>거부됨</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter) && (
            <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(''); setStatusFilter(undefined); }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLoading ? <LoadingSpinner /> : error ? (
          <EmptyState icon={Building2} title="파트너 목록을 불러올 수 없습니다" description="잠시 후 다시 시도해주세요" />
        ) : data?.data.length === 0 ? (
          <EmptyState icon={Building2} title="파트너가 없습니다" description="필터를 조정해보세요" />
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
          onOpenChange={(open) => { if (!open) closeDialog(); }}
          title={
            dialogType === 'approve' ? '파트너 승인' :
            dialogType === 'reject' ? '파트너 거부' :
            dialogType === 'suspend' ? '파트너 정지' : '정지 해제'
          }
          description={
            dialogType === 'approve' ? `"${selectedPartner?.companyName}"을(를) 승인하시겠습니까?` :
            dialogType === 'reject' ? `"${selectedPartner?.companyName}"을(를) 거부하시겠습니까?` :
            dialogType === 'suspend' ? `"${selectedPartner?.companyName}"을(를) 정지하시겠습니까?` :
            `"${selectedPartner?.companyName}" 정지를 해제하시겠습니까?`
          }
          confirmText={dialogType === 'approve' ? '승인' : dialogType === 'reject' ? '거부' : dialogType === 'suspend' ? '정지' : '해제'}
          cancelText="취소"
          onConfirm={handleConfirm}
          variant={dialogType === 'reject' || dialogType === 'suspend' ? 'destructive' : 'default'}
        />
      </div>
    </AdminLayout>
  );
}
