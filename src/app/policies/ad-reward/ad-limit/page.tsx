'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdLimitPolicy } from '@/lib/hooks/use-policies';
import { Shield } from 'lucide-react';

export default function AdLimitPage() {
  const { data: policy, isLoading } = useAdLimitPolicy();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="광고 제한 정책" description="사용자 광고 노출 제한 정책을 설정합니다" />

        {isLoading ? <LoadingSpinner /> : policy ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />제한 설정</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">사용자 일일 한도</span>
                  <span className="font-medium">{policy.userDailyLimit}회</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">전체 일일 한도</span>
                  <span className="font-medium">{policy.globalDailyLimit.toLocaleString()}회</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">게임당 한도</span>
                  <span className="font-medium">{policy.perGameLimit}회</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">쿨다운 시간</span>
                  <span className="font-medium">{policy.cooldownMinutes}분</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">활성 여부</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${policy.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>{policy.isActive ? '활성' : '비활성'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>정책 안내</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• 사용자 일일 한도: 개별 사용자가 하루에 시청 가능한 최대 광고 수</p>
                <p>• 전체 일일 한도: 플랫폼 전체에서 하루에 노출되는 최대 광고 수</p>
                <p>• 게임당 한도: 단일 블록픽 게임에서 허용되는 최대 광고 수</p>
                <p>• 쿨다운: 광고 시청 후 다음 시청까지 대기 시간</p>
                <p className="pt-2 text-xs">마지막 수정: {new Date(policy.updatedAt).toLocaleDateString('ko-KR')}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
