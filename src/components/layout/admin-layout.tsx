'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 확인 (Hydration 에러 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check if we have a token in localStorage
    const hasToken = !!localStorage.getItem('auth_token');

    // If no token and not loading, redirect to login
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
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
