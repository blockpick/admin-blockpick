'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { SpecPanel, SpecElementPicker, SpecDynamicLabels } from '@/components/spec';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // 모바일 Sheet(슬라이드 오버레이) 열림 상태
  const [mobileOpen, setMobileOpen] = useState(false);

  // 클라이언트 마운트 확인 (Hydration 에러 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // localStorage에 토큰이 없고 인증되지 않은 경우 로그인 페이지로 리다이렉트
    const hasToken = !!localStorage.getItem('auth_token');
    if (!isLoading && !hasToken && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, isMounted]);

  // 초기 렌더링에서는 항상 같은 구조를 렌더링 (Hydration 에러 방지)
  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* md 이상: 데스크톱 고정 사이드바 */}
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {/* md 미만: 모바일 슬라이드 Sheet 사이드바 */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0"
          aria-describedby={undefined}
        >
          {/* 접근성을 위한 숨겨진 제목 */}
          <SheetTitle className="sr-only">사이드바 메뉴</SheetTitle>
          <Sidebar inSheet onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* 헤더 + 메인 컨텐츠 영역 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
            {children}
          </main>
          <SpecPanel />
        </div>
      </div>
      <SpecElementPicker />
      <SpecDynamicLabels />
    </div>
  );
}
