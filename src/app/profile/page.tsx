'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Camera, Save } from 'lucide-react';
import type { AdminInfo } from '@/lib/types/auth';

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
  });

  const adminUser = user as AdminInfo | undefined;

  // 사용자 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (adminUser) {
      setFormData({
        nickname: adminUser.nickname || '',
        email: adminUser.email || '',
      });
      setProfileImageUrl(adminUser.profileImageUrl || null);
    }
  }, [adminUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: 프로필 업데이트 API 호출
      toast({
        title: '프로필 업데이트',
        description: '프로필이 성공적으로 업데이트되었습니다.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: '오류',
        description: '프로필 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="프로필"
          description="프로필 정보를 관리합니다"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* 프로필 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>계정 기본 정보를 확인하고 수정할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 프로필 이미지 */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profileImageUrl || adminUser?.profileImageUrl}
                      alt={adminUser?.nickname || adminUser?.email || 'User'}
                    />
                    <AvatarFallback className="text-2xl">
                      {(adminUser?.nickname || adminUser?.email || 'A')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {adminUser?.nickname || adminUser?.email || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{adminUser?.email || ''}</p>
                </div>
              </div>

              {/* 닉네임 */}
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                {isEditing ? (
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="닉네임을 입력하세요"
                  />
                ) : (
                  <div className="text-sm">{adminUser?.nickname || '-'}</div>
                )}
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="이메일을 입력하세요"
                  />
                ) : (
                  <div className="text-sm">{adminUser?.email || '-'}</div>
                )}
              </div>

              {/* 역할 */}
              <div className="space-y-2">
                <Label>역할</Label>
                <div className="text-sm">{adminUser?.role || 'USER'}</div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      저장
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>수정</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 계정 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>계정 정보</CardTitle>
              <CardDescription>계정 관련 추가 정보</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>사용자 ID</Label>
                <div className="text-sm font-mono">{adminUser?.id || '-'}</div>
              </div>
              <div className="space-y-2">
                <Label>역할</Label>
                <div className="text-sm">
                  {adminUser?.role || 'USER'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

