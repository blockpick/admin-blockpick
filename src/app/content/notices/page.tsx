'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import {
  useNotices,
  useCreateNotice,
  useUpdateNotice,
  useDeleteNotice,
} from '@/lib/hooks/use-content';
import { Notice, NoticeStatus, NoticeCategory } from '@/lib/types/content';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Bell, Plus, Search, X, Edit, Trash2, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<NoticeStatus, string> = {
  [NoticeStatus.DRAFT]: 'bg-gray-400',
  [NoticeStatus.PUBLISHED]: 'bg-green-500',
  [NoticeStatus.ARCHIVED]: 'bg-orange-400',
};
const statusLabels: Record<NoticeStatus, string> = {
  [NoticeStatus.DRAFT]: '임시저장',
  [NoticeStatus.PUBLISHED]: '게시됨',
  [NoticeStatus.ARCHIVED]: '보관됨',
};
const categoryLabels: Record<NoticeCategory, string> = {
  [NoticeCategory.GENERAL]: '일반',
  [NoticeCategory.UPDATE]: '업데이트',
  [NoticeCategory.MAINTENANCE]: '점검',
  [NoticeCategory.EVENT]: '이벤트',
  [NoticeCategory.POLICY]: '정책',
};

export default function NoticesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: NoticeCategory.GENERAL, status: NoticeStatus.DRAFT });
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading } = useNotices({ page, size: pageSize, search: search || undefined });
  const createNotice = useCreateNotice();
  const deleteNotice = useDeleteNotice();

  useEffect(() => { setPage(0); }, [search]);

  const handleCreate = async () => {
    try {
      await createNotice.mutateAsync(form);
      toast({ title: '공지사항 생성 완료' });
      setCreateOpen(false);
      setForm({ title: '', content: '', category: NoticeCategory.GENERAL, status: NoticeStatus.DRAFT });
    } catch {
      toast({ title: '생성 실패', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedNotice) return;
    try {
      await deleteNotice.mutateAsync(selectedNotice.id);
      toast({ title: '공지사항 삭제 완료' });
      setDeleteOpen(false);
      setSelectedNotice(null);
    } catch {
      toast({ title: '삭제 실패', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Notice>[] = [
    {
      accessorKey: 'title',
      header: '제목',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isPinned && <Pin className="h-3 w-3 text-primary" />}
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: '분류',
      cell: ({ row }) => <Badge variant="outline">{categoryLabels[row.original.category]}</Badge>,
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
      accessorKey: 'viewCount',
      header: '조회수',
      cell: ({ row }) => row.original.viewCount.toLocaleString(),
    },
    {
      accessorKey: 'createdAt',
      header: '작성일',
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
            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedNotice(row.original); setDeleteOpen(true); }}>
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
        <PageHeader title="공지사항" description="플랫폼 공지사항을 관리합니다" action={{ label: '공지 작성', icon: Plus, onClick: () => setCreateOpen(true) }} />

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="제목 검색..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {search && <Button variant="ghost" size="icon" onClick={() => setSearch('')}><X className="h-4 w-4" /></Button>}
        </div>

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={Bell} title="공지사항이 없습니다" description="새 공지사항을 작성하세요" action={{ label: '공지 작성', onClick: () => setCreateOpen(true) }} />
        ) : (
          <DataTable columns={columns} data={data?.data ?? []} enableServerSidePagination pageCount={data ? Math.ceil(data.count / pageSize) : 0} onPaginationChange={setPage} initialPageSize={pageSize} />
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>공지사항 작성</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>제목</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="공지 제목을 입력하세요" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>분류</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as NoticeCategory })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as NoticeStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NoticeStatus.DRAFT}>임시저장</SelectItem>
                      <SelectItem value={NoticeStatus.PUBLISHED}>게시</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="공지 내용을 입력하세요" rows={6} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>취소</Button>
              <Button onClick={handleCreate} disabled={!form.title || !form.content}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="공지사항 삭제" description={`"${selectedNotice?.title}" 공지사항을 삭제하시겠습니까?`} confirmText="삭제" cancelText="취소" onConfirm={handleDelete} variant="destructive" />
      </div>
    </AdminLayout>
  );
}
