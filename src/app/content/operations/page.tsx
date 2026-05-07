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
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import {
  useOperationPolicies,
  useCreateOperationPolicy,
  useDeleteOperationPolicy,
} from '@/lib/hooks/use-content';
import { OperationPolicy } from '@/lib/types/content';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, BookOpen, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function OperationsPage() {
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<OperationPolicy | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: '', version: '1.0' });
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading } = useOperationPolicies({ page, size: pageSize });
  const createPolicy = useCreateOperationPolicy();
  const deletePolicy = useDeleteOperationPolicy();

  const handleCreate = async () => {
    try {
      await createPolicy.mutateAsync({ ...form, isPublished: true });
      toast({ title: '운영 정책 생성 완료' });
      setCreateOpen(false);
      setForm({ title: '', content: '', category: '', version: '1.0' });
    } catch {
      toast({ title: '생성 실패', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedPolicy) return;
    try {
      await deletePolicy.mutateAsync(selectedPolicy.id);
      toast({ title: '운영 정책 삭제 완료' });
      setDeleteOpen(false);
      setSelectedPolicy(null);
    } catch {
      toast({ title: '삭제 실패', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<OperationPolicy>[] = [
    {
      accessorKey: 'title',
      header: '정책명',
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: 'category',
      header: '분류',
      cell: ({ row }) => <Badge variant="outline">{row.original.category || '-'}</Badge>,
    },
    {
      accessorKey: 'version',
      header: '버전',
      cell: ({ row }) => <span>v{row.original.version}</span>,
    },
    {
      accessorKey: 'isPublished',
      header: '게시 여부',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${row.original.isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span>{row.original.isPublished ? '게시됨' : '비게시'}</span>
        </div>
      ),
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
            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedPolicy(row.original); setDeleteOpen(true); }}>
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
        <PageHeader title="운영 정책" description="플랫폼 운영 정책을 관리합니다" action={{ label: '정책 추가', icon: Plus, onClick: () => setCreateOpen(true) }} />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={BookOpen} title="운영 정책이 없습니다" description="새 운영 정책을 추가하세요" action={{ label: '정책 추가', onClick: () => setCreateOpen(true) }} />
        ) : (
          <DataTable columns={columns} data={data?.data ?? []} enableServerSidePagination pageCount={data ? Math.ceil(data.count / pageSize) : 0} onPaginationChange={setPage} initialPageSize={pageSize} />
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>운영 정책 추가</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>정책명</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="정책명을 입력하세요" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>분류</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="예: 게임, 파트너, 사용자" />
                </div>
                <div className="space-y-2">
                  <Label>버전</Label>
                  <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="예: 1.0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder="운영 정책 내용을 입력하세요" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>취소</Button>
              <Button onClick={handleCreate} disabled={!form.title || !form.content}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="운영 정책 삭제" description={`"${selectedPolicy?.title}" 정책을 삭제하시겠습니까?`} confirmText="삭제" cancelText="취소" onConfirm={handleDelete} variant="destructive" />
      </div>
    </AdminLayout>
  );
}
