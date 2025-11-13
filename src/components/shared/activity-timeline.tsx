'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './loading-spinner';
import { formatDistanceToNow } from 'date-fns';
import { User, Gamepad2, Package, Activity, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Activity {
  id: string;
  type: string;
  description: string;
  userId?: string;
  gameId?: string;
  productId?: string;
  timestamp: string;
  [key: string]: unknown;
}

interface ActivityTimelineProps {
  activities?: Activity[];
  isLoading?: boolean;
  limit?: number;
}

const getActivityIcon = (type: string) => {
  if (type.toLowerCase().includes('user')) return User;
  if (type.toLowerCase().includes('game')) return Gamepad2;
  if (type.toLowerCase().includes('product')) return Package;
  return Activity;
};

const getActivityColor = (type: string) => {
  if (type.toLowerCase().includes('user')) return 'bg-blue-500';
  if (type.toLowerCase().includes('game')) return 'bg-green-500';
  if (type.toLowerCase().includes('product')) return 'bg-purple-500';
  return 'bg-gray-500';
};

export function ActivityTimeline({ activities = [], isLoading, limit = 20 }: ActivityTimelineProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '알 수 없음';
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.gameId) {
      router.push(`/games`);
    } else if (activity.userId) {
      router.push(`/users`);
    } else if (activity.productId) {
      router.push(`/products`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>활동 내역</CardTitle>
        <CardDescription>최근 시스템 활동 내역</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
            활동 내역이 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, limit).map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              const isClickable = !!(activity.gameId || activity.userId || activity.productId);

              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
                    isClickable ? 'cursor-pointer hover:bg-muted/50' : ''
                  }`}
                  onClick={() => isClickable && handleActivityClick(activity)}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    {(activity.userId || activity.gameId || activity.productId) && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <span>자세히 보기</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {activities.length > limit && (
              <div className="pt-2 border-t">
                <Button variant="ghost" className="w-full" onClick={() => router.push('/monitoring')}>
                  전체 활동 내역 보기 ({activities.length}개)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

