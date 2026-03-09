'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="설정"
          description="관리자 계정 설정 및 기본 설정을 관리합니다"
        />

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>프로필</CardTitle>
              <CardDescription>
                개인 정보를 업데이트합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" placeholder="이름을 입력하세요" defaultValue="Admin" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@blockpick.net"
                  defaultValue="admin@blockpick.net"
                />
              </div>
              <Button>변경사항 저장</Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>보안</CardTitle>
              <CardDescription>
                계정 보안 설정을 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">현재 비밀번호</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>비밀번호 변경</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>알림</CardTitle>
              <CardDescription>
                알림 수신 방법을 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>이메일 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    플랫폼 활동에 대한 이메일을 수신합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>신규 사용자 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    새 사용자가 가입할 때 알림을 받습니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>게임 활동</Label>
                  <p className="text-sm text-muted-foreground">
                    게임 완료에 대한 알림을 받습니다
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>보안 알림</Label>
                  <p className="text-sm text-muted-foreground">
                    중요 보안 알림을 받습니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>시스템</CardTitle>
              <CardDescription>
                일반 시스템 설정을 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>다크 모드</Label>
                  <p className="text-sm text-muted-foreground">
                    다크 테마를 활성화합니다
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>대시보드 자동 새로고침</Label>
                  <p className="text-sm text-muted-foreground">
                    대시보드 데이터를 자동으로 업데이트합니다
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
