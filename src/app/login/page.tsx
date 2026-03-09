'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin, useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
    if (hasToken && !authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login.mutateAsync({ email, password });

      // Ensure tokens are stored
      if (typeof window !== 'undefined' && response) {
        if (response.accessToken) {
          localStorage.setItem('auth_token', response.accessToken);
        }
        if (response.refreshToken) {
          localStorage.setItem('refresh_token', response.refreshToken);
        }
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh(); // Refresh to update auth state
    } catch (err: any) {
      // Extract error message from API error
      const errorMessage = err?.message || err?.data?.message || err?.error || '이메일 또는 비밀번호가 올바르지 않습니다';
      setError(errorMessage);
      console.error('Login error:', err);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary" />
          </div>
          <CardTitle className="text-2xl text-center">BlockPick Admin</CardTitle>
          <CardDescription className="text-center">
            관리자 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@blockpick.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">또는</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  localStorage.setItem('dev_mode', 'true');
                  localStorage.setItem('auth_token', 'dev_mock_token_' + Date.now());
                  localStorage.setItem('refresh_token', 'dev_mock_refresh_' + Date.now());
                  router.push('/dashboard');
                  router.refresh();
                }}
              >
                데브모드로 진입
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
