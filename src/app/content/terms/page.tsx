'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTerms, useCreateTerms } from '@/lib/hooks/use-content';
import { Terms, TermsType } from '@/lib/types/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const termsTypeLabels: Record<TermsType, string> = {
  [TermsType.SERVICE]: '서비스 이용약관',
  [TermsType.PRIVACY]: '개인정보 처리방침',
  [TermsType.MARKETING]: '마케팅 정보 수신',
  [TermsType.LOCATION]: '위치정보 이용약관',
  [TermsType.THIRD_PARTY]: '제3자 정보 제공',
};

export default function TermsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ type: TermsType.SERVICE, version: '', title: '', content: '', effectiveDate: '' });

  const { toast } = useToast();
  const { data, isLoading } = useTerms();
  const createTerms = useCreateTerms();

  const handleCreate = async () => {
    try {
      await createTerms.mutateAsync(form);
      toast({ title: '약관 생성 완료' });
      setCreateOpen(false);
    } catch {
      toast({ title: '생성 실패', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="약관" description="서비스 약관을 관리합니다" action={{ label: '약관 추가', icon: Plus, onClick: () => setCreateOpen(true) }} />

        {isLoading ? <LoadingSpinner /> : !data?.data.length ? (
          <EmptyState icon={FileText} title="약관이 없습니다" description="새 약관을 추가하세요" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.data.map((terms) => (
              <Card key={terms.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{terms.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">v{terms.version}</Badge>
                    {terms.isActive && <Badge>현행</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="secondary">{termsTypeLabels[terms.type]}</Badge>
                  <p className="text-sm text-muted-foreground">
                    시행일: {new Date(terms.effectiveDate).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{terms.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>약관 추가</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>약관 유형</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TermsType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(termsTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>버전</Label>
                  <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="예: 1.0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>제목</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="약관 제목" />
              </div>
              <div className="space-y-2">
                <Label>시행일</Label>
                <Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder="약관 내용을 입력하세요" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>취소</Button>
              <Button onClick={handleCreate} disabled={!form.title || !form.version}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
