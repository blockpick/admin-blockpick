'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useMissionPolicies, useUpdateMissionPolicy } from '@/lib/hooks/use-policies';
import { MissionPolicy, MissionType } from '@/lib/types/policy';
import { Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const missionTypeLabels: Record<MissionType, string> = {
  [MissionType.DAILY_LOGIN]: '매일 출석',
  [MissionType.WATCH_AD]: '광고 시청',
  [MissionType.PLAY_GAME]: '게임 참여',
  [MissionType.INVITE_FRIEND]: '친구 초대',
  [MissionType.COMPLETE_PROFILE]: '프로필 완성',
  [MissionType.SHARE]: '공유하기',
};

const resetTypeLabels: Record<string, string> = {
  DAILY: '매일',
  WEEKLY: '매주',
  ONCE: '1회',
};

export default function MissionPolicyPage() {
  const { data: missions, isLoading } = useMissionPolicies();
  const updateMission = useUpdateMissionPolicy();
  const { toast } = useToast();

  const handleToggle = async (mission: MissionPolicy, enabled: boolean) => {
    try {
      await updateMission.mutateAsync({ id: mission.id, data: { isEnabled: enabled } });
      toast({ title: `미션 ${enabled ? '활성화' : '비활성화'} 완료` });
    } catch {
      toast({ title: '처리 실패', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="공통 미션 정책" description="사용자 미션 정책을 설정합니다" />

        {isLoading ? <LoadingSpinner /> : !missions?.length ? (
          <EmptyState icon={Trophy} title="미션 정책이 없습니다" description="등록된 미션 정책이 없습니다" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {missions.map((mission) => (
              <Card key={mission.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{mission.name}</CardTitle>
                  <Switch
                    checked={mission.isEnabled}
                    onCheckedChange={(checked) => handleToggle(mission, checked)}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="outline">{missionTypeLabels[mission.missionType]}</Badge>
                  <p className="text-sm text-muted-foreground">{mission.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">보상</span>
                      <p className="font-medium">{mission.rewardAmount} {mission.rewardType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">초기화 주기</span>
                      <p className="font-medium">{resetTypeLabels[mission.resetType]}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">최대 횟수</span>
                      <p className="font-medium">{mission.maxCompletions}회</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
