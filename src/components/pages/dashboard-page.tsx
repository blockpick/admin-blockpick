"use client"

import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { userService } from "@/lib/api/user.service"

export function DashboardPage() {
  const {
    data: users,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => userService.getUsers({ page: 0, size: 10 }),
  })

  const handleRefresh = () => {
    void refetch()
  }

  return (
    <div className="container space-y-8 py-10">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="text-muted-foreground">
            React Query를 통해 외부 API 데이터를 클라이언트에서 캐싱합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            새로고침
          </Button>
          <Button>사용자 추가</Button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>총 사용자</CardTitle>
            <CardDescription>샘플 API 기준으로 계산된 사용자 수</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-semibold">{users?.data?.length ?? users?.count ?? 0}명</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API 상태</CardTitle>
            <CardDescription>요청 성공 여부</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : isError ? (
              <p className="text-lg font-medium text-destructive">오류 발생</p>
            ) : (
              <p className="text-lg font-medium text-primary">정상</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>데이터 갱신 전략</CardTitle>
            <CardDescription>1분마다 자동으로 갱신된다고 가정합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              staleTime 60초 설정으로 재방문 시 API 호출을 최소화합니다.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>최근 가입 관리자</CardTitle>
            <CardDescription>샘플 JSONPlaceholder 사용자 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <p className="text-sm text-destructive">
                데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.
              </p>
            ) : (
              <ul className="space-y-3">
                {users?.data?.map((user) => (
                  <li key={user.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{user.nickname || user.email.split('@')[0]}</p>
                      <span className="text-xs text-muted-foreground">
                        {user.userRole ?? "역할 미확인"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}


