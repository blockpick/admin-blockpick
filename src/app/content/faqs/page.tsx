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
import { useFaqs, useCreateFaq, useDeleteFaq } from '@/lib/hooks/use-content';
import { Faq } from '@/lib/types/content';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, HelpCircle, Plus, Search, X, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function FaqsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', isPublished: true });
  const pageSize = 10;

  const { toast } = useToast();
  const { data, isLoading } = useFaqs({ page, size: pageSize });
  const createFaq = useCreateFaq();
  const deleteFaq = useDeleteFaq();

  const handleCreate = async () => {
    try {
      await createFaq.mutateAsync(form);
      toast({ title: 'FAQ 생성 완료' });
      setCreateOpen(false);
      setForm({ question: '', answer: '', isPublished: true });
    } catch {
      toast({ title: '생성 실패', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedFaq) return;
    try {
      await deleteFaq.mutateAsync(selectedFaq.id);
      toast({ title: 'FAQ 삭제 완료' });
      setDeleteOpen(false);
      setSelectedFaq(null);
    } catch {
      toast({ title: '삭제 실패', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Faq>[] = [
    {
      accessorKey: 'question',
      header: '질문',
      cell: ({ row }) => <div className="font-medium max-w-sm truncate">{row.original.question}</div>,
    },
    {
      accessorKey: 'categoryName',
      header: '카테고리',
      cell: ({ row }) => row.original.categoryName
        ? <Badge variant="outline">{row.original.categoryName}</Badge>
        : <span className="text-muted-foreground">-</span>,
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
            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedFaq(row.original); setDeleteOpen(true); }}>
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
        <PageHeader title="FAQ" description="자주 묻는 질문을 관리합니다" action={{ label: 'FAQ 추가', icon: Plus, onClick: () => setCreateOpen(true) }} />

        {isLoading ? <LoadingSpinner /> : data?.data.length === 0 ? (
          <EmptyState icon={HelpCircle} title="FAQ가 없습니다" description="새 FAQ를 추가하세요" action={{ label: 'FAQ 추가', onClick: () => setCreateOpen(true) }} />
        ) : (
          <DataTable columns={columns} data={data?.data ?? []} enableServerSidePagination pageCount={data ? Math.ceil(data.count / pageSize) : 0} onPaginationChange={setPage} initialPageSize={pageSize} />
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>FAQ 추가</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>질문</Label>
                <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="질문을 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label>답변</Label>
                <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="답변을 입력하세요" rows={5} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>취소</Button>
              <Button onClick={handleCreate} disabled={!form.question || !form.answer}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="FAQ 삭제" description={`이 FAQ를 삭제하시겠습니까?`} confirmText="삭제" cancelText="취소" onConfirm={handleDelete} variant="destructive" />
      </div>
    </AdminLayout>
  );
}
