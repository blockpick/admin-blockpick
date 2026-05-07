'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRewardPolicies, useUpdateRewardPolicy } from '@/lib/hooks/use-policies';
import { RewardPolicy } from '@/lib/types/policy';
import { Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RewardPolicyPage() {
  const { data: rewards, isLoading } = useRewardPolicies();
  const updateReward = useUpdateRewardPolicy();
  const { toast } = useToast();

  const handleToggle = async (reward: RewardPolicy, enabled: boolean) => {
    try {
      await updateReward.mutateAsync({ id: reward.id, data: { isEnabled: enabled } });
      toast({ title: `보상 정책 ${enabled ? '활성화' : '비활성화'} 완료` });
    } catch {
      toast({ title: '처리 실패', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="기본 보상 정책" description="이벤트별 기본 보상 정책을 설정합니다" />

        {isLoading ? <LoadingSpinner /> : !rewards?.length ? (
          <EmptyState icon={Gift} title="보상 정책이 없습니다" description="등록된 보상 정책이 없습니다" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{reward.name}</CardTitle>
                  <Switch
                    checked={reward.isEnabled}
                    onCheckedChange={(checked) => handleToggle(reward, checked)}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="outline">{reward.eventType}</Badge>
                  {reward.description && (
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">보상 금액</span>
                      <p className="font-medium">{reward.rewardAmount} {reward.rewardType}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    마지막 수정: {new Date(reward.updatedAt).toLocaleDateString('ko-KR')}
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
