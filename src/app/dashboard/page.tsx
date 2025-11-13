'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ChartCard } from '@/components/shared/chart-card';
import { ActivityTimeline } from '@/components/shared/activity-timeline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Gamepad2, Package, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDashboardStats, useRecentGames, useRecentUsers, useSystemHealth, useChartData, useRecentActivities } from '@/lib/hooks/use-dashboard';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const { users, totalGames, activeGames, totalProducts, isLoading: statsLoading } = useDashboardStats();
  const { data: recentGamesData, isLoading: gamesLoading } = useRecentGames(5);
  const { data: recentUsersData, isLoading: usersLoading } = useRecentUsers(5);
  const { data: systemHealth, isLoading: healthLoading, error: healthError } = useSystemHealth();

  // Chart data
  const { data: usersChartData, isLoading: usersChartLoading, error: usersChartError } = useChartData('users', { period: chartPeriod });
  const { data: gamesChartData, isLoading: gamesChartLoading, error: gamesChartError } = useChartData('games', { period: chartPeriod });
  const { data: revenueChartData, isLoading: revenueChartLoading, error: revenueChartError } = useChartData('revenue', { period: chartPeriod });
  const { data: productsChartData, isLoading: productsChartLoading, error: productsChartError } = useChartData('products', { period: chartPeriod });

  // Activities
  const { data: activitiesData, isLoading: activitiesLoading, error: activitiesError } = useRecentActivities(10);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'bg-green-500';
      case 'DRAFT':
      case 'READY':
        return 'bg-yellow-500';
      case 'ENDED':
      case 'COMPLETED':
        return 'bg-blue-500';
      case 'FAILED':
      case 'PAUSED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (statsLoading || gamesLoading || usersLoading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="BlockPick 플랫폼 전체 현황"
        />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="총 사용자"
            value={users.toLocaleString()}
            icon={Users}
            description="전체 등록 사용자"
          />
          <StatsCard
            title="전체 게임"
            value={totalGames.toLocaleString()}
            icon={Gamepad2}
            description={`활성 게임: ${activeGames.toLocaleString()}`}
          />
          <StatsCard
            title="전체 상품"
            value={totalProducts.toLocaleString()}
            icon={Package}
            description="등록된 상품 수"
          />
          <StatsCard
            title="시스템 상태"
            value={healthError ? '오류' : systemHealth?.status === 'UP' ? '정상' : '점검중'}
            icon={healthError ? AlertCircle : systemHealth?.status === 'UP' ? CheckCircle2 : AlertCircle}
            description={healthError ? '시스템 상태를 불러올 수 없습니다' : systemHealth?.status === 'UP' ? '모든 시스템 정상' : '일부 시스템 점검 중'}
          />
        </div>

        {/* System Health Alert */}
        {systemHealth && !healthError && systemHealth.alerts && systemHealth.alerts.length > 0 && (
          <Card className="border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                시스템 알림
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemHealth.alerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge variant={alert.level === 'ERROR' ? 'destructive' : 'default'}>
                      {alert.level}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.component}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Metrics */}
        {systemHealth && !healthError && systemHealth.metrics && (
          <Card>
            <CardHeader>
              <CardTitle>시스템 메트릭</CardTitle>
              <CardDescription>최종 업데이트: {formatDate(systemHealth.timestamp)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">미발행 이벤트</p>
                  <p className="text-2xl font-bold">{systemHealth.metrics.unpublishedEvents}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">대기 중 트랜잭션</p>
                  <p className="text-2xl font-bold">{systemHealth.metrics.pendingTransactions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">전송된 트랜잭션</p>
                  <p className="text-2xl font-bold">{systemHealth.metrics.sentTransactions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">실패한 트랜잭션</p>
                  <p className="text-2xl font-bold text-red-500">{systemHealth.metrics.failedTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title="사용자 가입 추이"
            description="기간별 신규 사용자 가입 현황"
            data={usersChartError ? undefined : usersChartData}
            isLoading={usersChartLoading}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
          <ChartCard
            title="게임 생성 추이"
            description="기간별 게임 생성 현황"
            data={gamesChartError ? undefined : gamesChartData}
            isLoading={gamesChartLoading}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
          <ChartCard
            title="수익 추이"
            description="기간별 수익 현황"
            data={revenueChartError ? undefined : revenueChartData}
            isLoading={revenueChartLoading}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
          <ChartCard
            title="상품 등록 추이"
            description="기간별 상품 등록 현황"
            data={productsChartError ? undefined : productsChartData}
            isLoading={productsChartLoading}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
        </div>

        {/* Activities and Recent Items Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <ActivityTimeline
            activities={activitiesError ? undefined : activitiesData}
            isLoading={activitiesLoading}
            limit={10}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>최근 게임</CardTitle>
                <CardDescription>최근 생성된 게임 목록</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/games')}
              >
                전체 보기
              </Button>
            </CardHeader>
            <CardContent>
              {gamesLoading ? (
                <LoadingSpinner />
              ) : recentGamesData?.content && recentGamesData.content.length > 0 ? (
                <div className="space-y-4">
                  {recentGamesData.content.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      onClick={() => router.push(`/games`)}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(game.status)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{game.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {game.type} • {formatDate(game.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {game.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  게임이 없습니다
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 사용자</CardTitle>
              <CardDescription>최근 가입한 사용자 목록</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/users')}
            >
              전체 보기
            </Button>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <LoadingSpinner />
            ) : recentUsersData && recentUsersData.length > 0 ? (
              <div className="space-y-4">
                {recentUsersData.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => router.push(`/users`)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {(user.nickname || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.nickname || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email} • {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {user.userRole}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                사용자가 없습니다
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
