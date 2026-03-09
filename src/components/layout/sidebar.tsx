'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Package,
  Link as LinkIcon,
  Folder,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/hooks/use-auth';
import { useState, useEffect } from 'react';

// 사이드바 메뉴 정의 (한국어 라벨)
const navigation = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '사용자 관리',
    href: '/users',
    icon: Users,
  },
  {
    name: '게임 관리',
    href: '/games',
    icon: Gamepad2,
  },
  {
    name: '상품 관리',
    href: '/products',
    icon: Package,
  },
  {
    name: '블록체인',
    href: '/blockchain',
    icon: LinkIcon,
  },
  {
    name: '파일 관리',
    href: '/storage',
    icon: Folder,
  },
  {
    name: '모니터링',
    href: '/monitoring',
    icon: BarChart3,
  },
  {
    name: '설정',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  /** 모바일 Sheet 내부에서 렌더링 여부 (Sheet 사용 시 collapse 버튼 숨김) */
  inSheet?: boolean;
  /** Sheet 닫기 콜백 */
  onClose?: () => void;
}

export function Sidebar({ inSheet = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();

  // localStorage에서 collapse 상태 복원 (기본값: 펼침)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  // collapse 상태가 바뀔 때 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Sheet 내부에서는 항상 펼침 상태 유지
  const isCollapsed = inSheet ? false : collapsed;

  return (
    <div
      className={cn(
        // 너비 전환 애니메이션
        'flex h-full flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* 로고 + 토글 버튼 영역 */}
      <div
        className={cn(
          'flex h-16 items-center border-b',
          isCollapsed ? 'justify-center px-0' : 'justify-between px-6'
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center space-x-2"
          onClick={onClose}
        >
          {/* 브랜드 색상 사각형 로고 */}
          <div className="h-8 w-8 shrink-0 rounded-lg bg-primary" />
          {/* 축소 상태에서는 텍스트 숨김 */}
          {!isCollapsed && (
            <span className="text-xl font-bold whitespace-nowrap">BlockPick Admin</span>
          )}
        </Link>

        {/* 사이드바 토글 버튼 (Sheet 내부가 아닐 때만) */}
        {!inSheet && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <div key={item.name} className="relative group">
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isCollapsed ? 'justify-center' : 'space-x-3',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {/* 축소 상태에서는 메뉴 텍스트 숨김 */}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>

              {/* 축소 상태일 때 호버 툴팁 */}
              {isCollapsed && (
                <div
                  className={cn(
                    'pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2',
                    'rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md',
                    'whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100'
                  )}
                >
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 로그아웃 영역 */}
      <div className="border-t p-2">
        <div className="relative group">
          <Button
            variant="ghost"
            className={cn(
              'w-full transition-colors',
              isCollapsed ? 'justify-center px-0' : 'justify-start'
            )}
            onClick={() => {
              logout.mutate();
              onClose?.();
            }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">로그아웃</span>}
          </Button>

          {/* 축소 상태일 때 로그아웃 툴팁 */}
          {isCollapsed && (
            <div
              className={cn(
                'pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2',
                'rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md',
                'whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100'
              )}
            >
              로그아웃
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
