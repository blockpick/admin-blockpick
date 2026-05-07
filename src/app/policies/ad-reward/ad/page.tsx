'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAdPolicies, useUpdateAdPolicy } from '@/lib/hooks/use-policies';
import { AdPolicy, AdType } from '@/lib/types/policy';
import { Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const adTypeLabels: Record<AdType, string> = {
  [AdType.REWARDED]: '리워드 광고',
  [AdType.INTERSTITIAL]: '전면 광고',
  [AdType.BANNER]: '배너 광고',
};

export default function AdPolicyPage() {
  const { data: policies, isLoading } = useAdPolicies();
  const updatePolicy = useUpdateAdPolicy();
  const { toast } = useToast();

  const handleToggle = async (policy: AdPolicy, enabled: boolean) => {
    try {
      await updatePolicy.mutateAsync({ id: policy.id, data: { isEnabled: enabled } });
      toast({ title: `광고 정책 ${enabled ? '활성화' : '비활성화'} 완료` });
    } catch {
      toast({ title: '처리 실패', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="공통 광고 정책" description="플랫폼 광고 정책을 설정합니다" />

        {isLoading ? <LoadingSpinner /> : !policies?.length ? (
          <EmptyState icon={Megaphone} title="광고 정책이 없습니다" description="등록된 광고 정책이 없습니다" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{policy.name}</CardTitle>
                  <Switch
                    checked={policy.isEnabled}
                    onCheckedChange={(checked) => handleToggle(policy, checked)}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="outline">{adTypeLabels[policy.adType]}</Badge>
                    <Badge variant="secondary">{policy.network}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">일일 한도</span>
                      <p className="font-medium">{policy.dailyLimit}회</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">쿨다운</span>
                      <p className="font-medium">{policy.cooldownMinutes}분</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">보상 금액</span>
                      <p className="font-medium">{policy.rewardAmount} {policy.rewardType}</p>
                    </div>
                  </div>
                  {policy.description && (
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    마지막 수정: {new Date(policy.updatedAt).toLocaleDateString('ko-KR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
