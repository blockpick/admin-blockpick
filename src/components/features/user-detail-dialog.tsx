'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/lib/hooks/use-users';
import { UserStatus } from '@/lib/types/user';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Mail, Calendar, Shield, DollarSign, Coins } from 'lucide-react';

interface UserDetailDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

const statusColors: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'bg-green-500',
  [UserStatus.INACTIVE]: 'bg-gray-500',
  [UserStatus.SUSPENDED]: 'bg-red-500',
  [UserStatus.DELETED]: 'bg-black',
};

export function UserDetailDialog({
  userId,
  open,
  onOpenChange,
  onEdit,
}: UserDetailDialogProps) {
  const { data, isLoading, error } = useUser(userId || '');

  if (!userId) return null;

  const user = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>사용자 상세 정보</DialogTitle>
          <DialogDescription>사용자의 상세 정보를 확인합니다.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !user ? (
          <div className="text-center py-8 text-muted-foreground">
            사용자 정보를 불러올 수 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {/* 프로필 섹션 */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback>
                  {(user.nickname || user.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    {user.nickname || user.email.split('@')[0]}
                  </h3>
                  <Badge variant="outline">{user.userRole}</Badge>
                  {user.status && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          statusColors[user.status] || 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm text-muted-foreground capitalize">
                        {user.status.toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  {user.nickname && (
                    <div className="flex items-center gap-2">
                      <span>닉네임: {user.nickname}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* 기본 정보 */}
            <div className="space-y-4">
              <h4 className="font-semibold">기본 정보</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">사용자 ID</div>
                  <div className="font-medium">{user.id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">역할</div>
                  <Badge variant="outline">{user.userRole}</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">가입일</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">상태</div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        statusColors[user.status || UserStatus.ACTIVE] || 'bg-gray-400'
                      }`}
                    />
                    <span className="capitalize">
                      {(user.status || UserStatus.ACTIVE).toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 포인트/캐시 정보 */}
            <div className="space-y-4">
              <h4 className="font-semibold">잔액 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Coins className="h-4 w-4" />
                    <span className="text-sm">포인트</span>
                  </div>
                  <div className="text-2xl font-bold">{user.point?.toLocaleString() || 0}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">캐시</span>
                  </div>
                  <div className="text-2xl font-bold">{user.cash?.toLocaleString() || 0}</div>
                </div>
              </div>
            </div>

            {/* 소셜 계정 정보 */}
            {user.isSocialAccount && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">소셜 계정 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">소셜 제공자</div>
                      <Badge>{user.socialProvider || 'Unknown'}</Badge>
                    </div>
                    {user.socialEmail && (
                      <div>
                        <div className="text-muted-foreground mb-1">소셜 이메일</div>
                        <div>{user.socialEmail}</div>
                      </div>
                    )}
                    {user.socialName && (
                      <div>
                        <div className="text-muted-foreground mb-1">소셜 이름</div>
                        <div>{user.socialName}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 알림 설정 */}
            <Separator />
            <div className="space-y-4">
              <h4 className="font-semibold">알림 설정</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>푸시 알림</span>
                  <Badge variant={user.isPushNotification ? 'default' : 'secondary'}>
                    {user.isPushNotification ? '활성화' : '비활성화'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>마케팅 알림</span>
                  <Badge variant={user.isMarketingNotification ? 'default' : 'secondary'}>
                    {user.isMarketingNotification ? '활성화' : '비활성화'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-2 pt-4">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  수정
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)}>닫기</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

