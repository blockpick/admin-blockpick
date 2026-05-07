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
  Building2,
  Flag,
  CreditCard,
  Megaphone,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/hooks/use-auth';
import { useState, useEffect } from 'react';

// 그룹형 사이드바 메뉴 정의
const navigationGroups = [
  {
    label: null,
    items: [
      { name: '홈', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: '파트너 관리',
    icon: Building2,
    href: '/partners',
    items: [
      { name: '전체 파트너', href: '/partners' },
      { name: '승인 대기', href: '/partners/pending' },
      { name: '운영 중', href: '/partners/active' },
      { name: '정지 / 제재', href: '/partners/suspended' },
    ],
  },
  {
    label: '블록픽 관리',
    icon: Gamepad2,
    href: '/games',
    items: [
      { name: '전체 블록픽', href: '/games' },
    ],
  },
  {
    label: '신고 / 제재',
    icon: Flag,
    href: '/reports',
    items: [
      { name: '신고 목록', href: '/reports' },
      { name: '처리 대기', href: '/reports/pending' },
      { name: '처리 완료', href: '/reports/processed' },
      { name: '제재 이력', href: '/reports/sanctions' },
    ],
  },
  {
    label: '과금 / 구독',
    icon: CreditCard,
    href: '/billing',
    items: [
      { name: '전체 플랜 현황', href: '/billing' },
      { name: '결제 상태', href: '/billing/payments' },
      { name: '결제 실패 / 연체', href: '/billing/failures' },
      { name: '사용량 현황', href: '/billing/usage' },
      { name: '수동 조정 이력', href: '/billing/adjustments' },
    ],
  },
  {
    label: '광고 / 보상 정책',
    icon: Megaphone,
    href: '/policies/ad-reward',
    items: [
      { name: '공통 광고 정책', href: '/policies/ad-reward/ad' },
      { name: '광고 제한 정책', href: '/policies/ad-reward/ad-limit' },
      { name: '공통 미션 정책', href: '/policies/ad-reward/mission' },
      { name: '기본 보상 정책', href: '/policies/ad-reward/reward' },
    ],
  },
  {
    label: '콘텐츠 / 정책',
    icon: FileText,
    href: '/content',
    items: [
      { name: '공지사항', href: '/content/notices' },
      { name: 'FAQ', href: '/content/faqs' },
      { name: '약관', href: '/content/terms' },
      { name: '운영 정책', href: '/content/operations' },
      { name: '배너 관리', href: '/content/banners' },
    ],
  },
  {
    label: '분석',
    icon: BarChart3,
    href: '/dashboard',
    items: [
      { name: '대시보드', href: '/dashboard' },
    ],
  },
  {
    label: '로그 / 감사',
    icon: BarChart3,
    href: '/monitoring',
    items: [
      { name: '모니터링', href: '/monitoring' },
    ],
  },
  {
    label: '도구',
    items: [
      { name: '사용자 관리', href: '/users', icon: Users },
      { name: '상품 관리', href: '/products', icon: Package },
      { name: '블록체인', href: '/blockchain', icon: LinkIcon },
      { name: '파일 관리', href: '/storage', icon: Folder },
    ],
  },
  {
    label: null,
    items: [
      { name: '설정', href: '/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  inSheet?: boolean;
  onClose?: () => void;
}

export function Sidebar({ inSheet = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  // 그룹 열림/닫힘 상태
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // 현재 경로에 해당하는 그룹은 기본 열림
    return {};
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // 현재 경로에 해당하는 그룹 자동 열기
  useEffect(() => {
    const newOpen: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      if (group.label && group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))) {
        newOpen[group.label] = true;
      }
    });
    setOpenGroups((prev) => ({ ...prev, ...newOpen }));
  }, [pathname]);

  const isCollapsed = inSheet ? false : collapsed;

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* 로고 + 토글 */}
      <div
        className={cn(
          'flex h-16 items-center border-b',
          isCollapsed ? 'justify-center px-0' : 'justify-between px-6'
        )}
      >
        <Link href="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
          <div className="h-8 w-8 shrink-0 rounded-lg bg-primary" />
          {!isCollapsed && (
            <span className="text-xl font-bold whitespace-nowrap">BlockPick Admin</span>
          )}
        </Link>

        {!inSheet && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-2 py-4">
        {navigationGroups.map((group, groupIdx) => {
          // 라벨 없는 그룹 (단순 메뉴들)
          if (!group.label || !group.href) {
            return (
              <div key={groupIdx}>
                {!isCollapsed && group.label && (
                  <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</p>
                )}
                {group.items.map((item) => {
                  const Icon = (item as { icon?: React.ComponentType<{ className?: string }> }).icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <div key={item.href} className="relative group">
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
                        {Icon && <Icon className="h-5 w-5 shrink-0" />}
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                      {isCollapsed && (
                        <div className={cn(
                          'pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2',
                          'rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md',
                          'whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100'
                        )}>
                          {item.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }

          // 라벨 있는 그룹 (접이식)
          const GroupIcon = group.icon;
          const isGroupActive = group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
          const isOpen = openGroups[group.label] ?? isGroupActive;

          if (isCollapsed) {
            // 축소 상태: 그룹 아이콘만 표시
            return (
              <div key={groupIdx} className="relative group">
                <Link
                  href={group.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isGroupActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {GroupIcon && <GroupIcon className="h-5 w-5 shrink-0" />}
                </Link>
                <div className={cn(
                  'pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2',
                  'rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md',
                  'whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100'
                )}>
                  {group.label}
                </div>
              </div>
            );
          }

          return (
            <div key={groupIdx}>
              <button
                onClick={() => toggleGroup(group.label!)}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isGroupActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex items-center space-x-3">
                  {GroupIcon && <GroupIcon className="h-5 w-5 shrink-0" />}
                  <span>{group.label}</span>
                </div>
                <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
              </button>

              {isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="border-t p-2">
        <div className="relative group">
          <Button
            variant="ghost"
            className={cn(
              'w-full transition-colors',
              isCollapsed ? 'justify-center px-0' : 'justify-start'
            )}
            onClick={() => { logout.mutate(); onClose?.(); }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">로그아웃</span>}
          </Button>
          {isCollapsed && (
            <div className={cn(
              'pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2',
              'rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md',
              'whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100'
            )}>
              로그아웃
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
