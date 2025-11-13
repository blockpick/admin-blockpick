'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGame } from '@/lib/hooks/use-games';
import { gameService } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface LeaderboardEntry {
  userId: string;
  userEmail: string;
  userNickname?: string;
  rank: number;
  score?: number;
  entryCount: number;
}

const rankIcons = [Trophy, Medal, Award];

export default function LeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const [page, setPage] = useState(0);

  const { data: game, isLoading: gameLoading } = useGame(gameId);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['games', gameId, 'leaderboard', { page, size: 20 }],
    queryFn: () => gameService.getGameLeaderboard(gameId, { page, size: 20 }),
    enabled: !!gameId,
  });

  const entries = leaderboardData?.content || [];
  const totalPages = leaderboardData?.totalPages || 0;

  const columns: ColumnDef<LeaderboardEntry>[] = [
    {
      accessorKey: 'rank',
      header: '순위',
      cell: ({ row }) => {
        const rank = row.getValue('rank') as number;
        const Icon = rankIcons[rank - 1];
        return (
          <div className="flex items-center space-x-2">
            {Icon && rank <= 3 ? (
              <Icon className={`h-5 w-5 ${
                rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-orange-500'
              }`} />
            ) : null}
            <span className="font-bold">{rank}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'userEmail',
      header: '이메일',
      cell: ({ row }) => {
        const email = row.getValue('userEmail') as string;
        return <div className="font-medium">{email}</div>;
      },
    },
    {
      accessorKey: 'userNickname',
      header: '닉네임',
      cell: ({ row }) => {
        const nickname = row.getValue('userNickname') as string | undefined;
        return <div>{nickname || '-'}</div>;
      },
    },
    {
      accessorKey: 'score',
      header: '점수',
      cell: ({ row }) => {
        const score = row.getValue('score') as number | undefined;
        return score !== undefined ? <Badge>{score.toLocaleString()}</Badge> : <span>-</span>;
      },
    },
    {
      accessorKey: 'entryCount',
      header: '참가 횟수',
      cell: ({ row }) => {
        const count = row.getValue('entryCount') as number;
        return <div>{count}회</div>;
      },
    },
  ];

  if (gameLoading || leaderboardLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로
          </Button>
          <PageHeader
            title={`${game?.title || '게임'} 리더보드`}
            description="게임 참가자 순위표"
          />
        </div>

        {entries.length === 0 ? (
          <EmptyState
            title="리더보드 데이터가 없습니다"
            description="아직 참가자가 없습니다."
          />
        ) : (
          <>
            <DataTable columns={columns} data={entries} />
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  이전
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

