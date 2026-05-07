'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import { useBanners, useCreateBanner, useDeleteBanner } from '@/lib/hooks/use-content';
import { Banner, BannerStatus, BannerPosition } from '@/lib/types/content';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Image, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<BannerStatus, string> = {
  [BannerStatus.ACTIVE]: 'bg-green-500',
  [BannerStatus.INACTIVE]: 'bg-gray-400',
  [BannerStatus.SCHEDULED]: 'bg-blue-500',
  [BannerStatus.EXPIRED]: 'bg-orange-400',
};
const statusLabels: Record<BannerStatus, string> = {
  [BannerStatus.ACTIVE]: '활성',
  [BannerStatus.INACTIVE]: '비활성',
  [BannerStatus.SCHEDULED]: '예약됨',
  [BannerStatus.EXPIRED]: '만료됨',
};
const positionLabels: Record<BannerPosition, string> = {
  [BannerPosition.HOME_TOP]: '홈 상단',
  [BannerPosition.HOME_MIDDLE]: '홈 중단',
  [BannerPosition.GAME_LIST]: '게임 목록',
  [BannerPosition.DETAIL_BOTTOM]: '상세 하단',
};

export default function BannersPage() {
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', position: BannerPosition.HOME_TOP, sortOrder: 1 });
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading } = useBanners({ page, size: pageSize });
  const createBanner = useCreateBanner();
  const deleteBanner = useDeleteBanner();

  const handleCreate = async () => {
    try {
      await createBanner.mutateAsync({ ...form, status: BannerStatus.ACTIVE, clickCount: 0, impressionCount: 0 });
      toast({ title: '배너 생성 완료' });
      setCreateOpen(false);
      setForm({ title: '', imageUrl: '', linkUrl: '', position: BannerPosition.HOME_TOP, sortOrder: 1 });
    } catch {
      toast({ title: '생성 실패', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    try {
      await deleteBanner.mutateAsync(selectedBanner.id);
      toast({ title: '배너 삭제 완료' });
      setDeleteOpen(false);
      setSelectedBanner(null);
    } catch {
      toast({ title: '삭제 실패', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Banner>[] = [
    {
      accessorKey: 'title',
      header: '배너명',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-16 rounded bg-muted overflow-hidden">
            {row.original.imageUrl && (
              <img src={row.original.imageUrl} alt={row.original.title} className="h-full w-full object-cover" />
            )}
          </div>
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'position',
      header: '노출 위치',
      cell: ({ row }) => <Badge variant="outline">{positionLabels[row.original.position]}</Badge>,
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColors[s]}`} />
            <span>{statusLabels[s]}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'sortOrder',
      header: '순서',
      cell: ({ row }) => row.original.sortOrder,
    },
    {
      accessorKey: 'clickCount',
      header: '클릭 수',
      cell: ({ row }) => row.original.clickCount.toLocaleString(),
    },
    {
      accessorKey: 'impressionCount',
      header: '노출 수',
      cell: ({ row }) => row.original.impressionCount.toLocaleString(),
    },
    {
      accessorKey: 'createdAt',
      header: '생성일',
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
            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedBanner(row.original); setDeleteOpen(true); }}>
              <Trash2 className="mr-2 h-4 w-4" /> 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="배너 관리" description="앱 내 배너를 관리합니다" action={{ label: '배너 추가', icon: Plus, onClick: () => setCreateOpen(true) }} />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={Image} title="배너가 없습니다" description="새 배너를 추가하세요" action={{ label: '배너 추가', onClick: () => setCreateOpen(true) }} />
        ) : (
          <DataTable columns={columns} data={data?.data ?? []} enableServerSidePagination pageCount={data ? Math.ceil(data.count / pageSize) : 0} onPaginationChange={setPage} initialPageSize={pageSize} />
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>배너 추가</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>배너명</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="배너명을 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label>이미지 URL</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>링크 URL (선택)</Label>
                <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>노출 위치</Label>
                  <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v as BannerPosition })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(positionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>노출 순서</Label>
                  <Input type="number" min={1} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>취소</Button>
              <Button onClick={handleCreate} disabled={!form.title || !form.imageUrl}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="배너 삭제" description={`"${selectedBanner?.title}" 배너를 삭제하시겠습니까?`} confirmText="삭제" cancelText="취소" onConfirm={handleDelete} variant="destructive" />
      </div>
    </AdminLayout>
  );
}
