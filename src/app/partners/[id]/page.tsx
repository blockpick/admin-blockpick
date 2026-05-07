'use client';

import { use } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePartner } from '@/lib/hooks/use-partners';
import { PartnerStatus } from '@/lib/types/partner';
import { Building2 } from 'lucide-react';

const statusLabels: Record<PartnerStatus, string> = {
  [PartnerStatus.PENDING]: '승인 대기',
  [PartnerStatus.ACTIVE]: '운영 중',
  [PartnerStatus.SUSPENDED]: '정지',
  [PartnerStatus.REJECTED]: '거부됨',
};

const statusVariants: Record<PartnerStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [PartnerStatus.PENDING]: 'secondary',
  [PartnerStatus.ACTIVE]: 'default',
  [PartnerStatus.SUSPENDED]: 'destructive',
  [PartnerStatus.REJECTED]: 'outline',
};

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: partner, isLoading, error } = usePartner(id);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title={partner?.companyName ?? '파트너 상세'}
          description="파트너사 상세 정보"
        />

        {isLoading ? <LoadingSpinner /> : error || !partner ? (
          <EmptyState icon={Building2} title="파트너를 찾을 수 없습니다" description="존재하지 않는 파트너입니다" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">상태</span>
                  <Badge variant={statusVariants[partner.status]}>{statusLabels[partner.status]}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">회사명</span>
                  <span className="font-medium">{partner.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">사업자번호</span>
                  <span>{partner.businessNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">대표자</span>
                  <span>{partner.representativeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">이메일</span>
                  <span>{partner.email}</span>
                </div>
                {partner.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">전화번호</span>
                    <span>{partner.phoneNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">업종</span>
                  <Badge variant="outline">{partner.category}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>운영 현황</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 게임 수</span>
                  <span className="font-medium">{partner.totalGames ?? 0}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">활성 게임</span>
                  <span>{partner.activeGames ?? 0}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 참여자</span>
                  <span>{(partner.totalPlayers ?? 0).toLocaleString()}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">신청일</span>
                  <span className="text-sm">{new Date(partner.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                {partner.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">승인일</span>
                    <span className="text-sm">{new Date(partner.approvedAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
                {partner.suspendedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">정지일</span>
                    <span className="text-sm text-red-600">{new Date(partner.suspendedAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                )}
                {partner.suspendedReason && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">정지 사유</span>
                    <span className="text-sm text-red-600">{partner.suspendedReason}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {partner.description && (
              <Card className="md:col-span-2">
                <CardHeader><CardTitle>소개</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{partner.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
