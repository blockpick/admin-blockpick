'use client';

import { useRouter } from 'next/navigation';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser, useLogout } from '@/lib/hooks/use-auth';
import { ThemeToggle } from './theme-toggle';
import { SpecModeToggle } from '@/components/spec';
import type { AdminInfo } from '@/lib/types/auth';

interface HeaderProps {
  /** 모바일 햄버거 메뉴 클릭 시 사이드바 Sheet를 여는 콜백 */
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const adminUser = user as AdminInfo | undefined;

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 로그아웃 실패 시에도 토큰 삭제 후 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
      router.push('/login');
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* 왼쪽: 모바일 햄버거 + 검색바 */}
      <div className="flex flex-1 items-center space-x-3">
        {/* 모바일(md 미만)에서만 햄버거 버튼 표시 */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuClick}
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* 검색바: 모바일에서 숨김, md 이상에서 표시 */}
        <div className="relative hidden md:block w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="전체 검색..."
            className="pl-10"
          />
        </div>
      </div>

      {/* 오른쪽: 모드 토글 + 테마 토글 + 알림 + 사용자 메뉴 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {process.env.NODE_ENV === 'development' && <SpecModeToggle />}
        <ThemeToggle />

        {/* 알림 벨 */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {/* 알림 뱃지 */}
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* 사용자 드롭다운 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={adminUser?.profileImageUrl}
                  alt={adminUser?.nickname || adminUser?.email || '사용자'}
                />
                <AvatarFallback>
                  {(adminUser?.nickname || adminUser?.email || 'A')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {adminUser?.nickname || adminUser?.email || '사용자'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {adminUser?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              프로필
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              설정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              {logout.isPending ? '로그아웃 중...' : '로그아웃'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
