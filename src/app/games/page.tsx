'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { CreateGameDialog } from '@/components/features/create-game-dialog';
import { GameDetailDialog } from '@/components/features/game-detail-dialog';
import { EditGameDialog } from '@/components/features/edit-game-dialog';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import { GameFilterBar } from '@/components/features/game-filter-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGames, useDeleteGame, useForceEndGame, useGameStats, useSettleGame } from '@/lib/hooks/use-games';
import { Game, GameStatusType, GameType } from '@/lib/types/game';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Gamepad2, Eye, Edit, Trash2, Power, Trophy, ListOrdered, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  PUBLISHED: 'bg-green-500',
  ARCHIVED: 'bg-orange-500',
  MAINTENANCE: 'bg-yellow-500',
  READY: 'bg-blue-500',
  SCHEDULED: 'bg-purple-500',
  ACTIVE: 'bg-green-500',
  IN_PROGRESS: 'bg-blue-500',
  PAUSED: 'bg-yellow-500',
  SETTLING: 'bg-orange-500',
  ENDED: 'bg-gray-500',
  COMPLETED: 'bg-green-500',
  FAILED: 'bg-red-500',
};

export default function GamesPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forceEndDialogOpen, setForceEndDialogOpen] = useState(false);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGameTitle, setSelectedGameTitle] = useState<string>('');

  // 필터 상태
  const [typeFilter, setTypeFilter] = useState<GameType | undefined>();
  const [statusFilter, setStatusFilter] = useState<GameStatusType | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const { toast } = useToast();
  const { data, isLoading, error } = useGames({
    page,
    size: 10,
    type: typeFilter,
    status: statusFilter,
    category: categoryFilter,
    search: searchQuery || undefined,
    title: searchQuery || undefined,
  });
  const { data: statsData, isLoading: statsLoading } = useGameStats();
  const deleteGame = useDeleteGame();
  const forceEndGame = useForceEndGame();
  const settleGame = useSettleGame();

  // 검색어나 필터가 변경될 때 페이지를 0으로 리셋
  useEffect(() => {
    setPage(0);
  }, [searchQuery, typeFilter, statusFilter, categoryFilter, startDate, endDate]);

  const handleViewDetails = (gameId: string) => {
    setSelectedGameId(gameId);
    setDetailDialogOpen(true);
  };

  const handleEdit = (gameId: string) => {
    setSelectedGameId(gameId);
    setEditDialogOpen(true);
  };

  const handleDelete = (gameId: string, title: string) => {
    setSelectedGameId(gameId);
    setSelectedGameTitle(title);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGameId) return;

    try {
      await deleteGame.mutateAsync(selectedGameId);
      toast({
        title: '게임 삭제 성공',
        description: '게임이 성공적으로 삭제되었습니다.',
      });
      setDeleteDialogOpen(false);
      setSelectedGameId(null);
    } catch (error) {
      toast({
        title: '게임 삭제 실패',
        description: error instanceof Error ? error.message : '게임 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleForceEnd = (gameId: string, title: string) => {
    setSelectedGameId(gameId);
    setSelectedGameTitle(title);
    setForceEndDialogOpen(true);
  };

  const handleConfirmForceEnd = async () => {
    if (!selectedGameId) return;

    try {
      await forceEndGame.mutateAsync(selectedGameId);
      toast({
        title: '게임 강제 종료 성공',
        description: '게임이 강제로 종료되었습니다.',
      });
      setForceEndDialogOpen(false);
      setSelectedGameId(null);
    } catch (error) {
      toast({
        title: '게임 강제 종료 실패',
        description: error instanceof Error ? error.message : '게임 강제 종료 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSettle = (gameId: string, title: string) => {
    setSelectedGameId(gameId);
    setSelectedGameTitle(title);
    setSettleDialogOpen(true);
  };

  const handleConfirmSettle = async () => {
    if (!selectedGameId) return;

    try {
      await settleGame.mutateAsync(selectedGameId);
      toast({
        title: '정산 성공',
        description: '게임 정산이 완료되었습니다.',
      });
      setSettleDialogOpen(false);
      setSelectedGameId(null);
    } catch (error) {
      toast({
        title: '정산 실패',
        description: error instanceof Error ? error.message : '게임 정산 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleResetFilters = () => {
    setTypeFilter(undefined);
    setStatusFilter(undefined);
    setCategoryFilter(undefined);
    setSearchQuery('');
    setStartDate(undefined);
    setEndDate(undefined);
};

const columns: ColumnDef<Game>[] = [
  {
    accessorKey: 'title',
    header: '게임',
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded bg-muted overflow-hidden">
          {row.original.thumbnailUrl && (
            <img
              src={row.original.thumbnailUrl}
              alt={row.original.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">
            {row.original.description}
          </div>
        </div>
      </div>
    ),
  },
    {
      accessorKey: 'type',
      header: '유형',
      cell: ({ row }) => {
        const game = row.original as any;
        return <Badge variant="outline">{game.type || game.gameType || '-'}</Badge>;
      },
    },
  {
    accessorKey: 'category',
    header: '카테고리',
    cell: ({ row }) => (
        <Badge variant="outline">{row.original.category || '-'}</Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }) => {
      const status = row.original.status || 'UNKNOWN';
      return (
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${statusColors[status] || 'bg-gray-400'}`} />
          <span className="capitalize">{status.toLowerCase()}</span>
        </div>
      );
    },
  },
  {
      accessorKey: 'rewardPoint',
    header: '보상 포인트',
      cell: ({ row }) => {
        const game = row.original as any;
        return (
          <span className="font-medium">
            {game.rewardPoint || game.rewardPoints || 0} pts
          </span>
        );
      },
  },
  {
    id: 'actions',
    enableSorting: false,
      cell: ({ row }) => {
        const game = row.original as any;
        const gameId = game.id;
        const status = game.status || 'UNKNOWN';
        const canForceEnd = status === 'ACTIVE' || status === 'IN_PROGRESS';
        const canSettle = status === 'ENDED';

        return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(gameId)}>
                <Eye className="mr-2 h-4 w-4" />
                상세보기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(gameId)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/games/${gameId}/leaderboard`)}>
                <ListOrdered className="mr-2 h-4 w-4" />
                리더보드 보기
              </DropdownMenuItem>
              {canForceEnd && (
                <DropdownMenuItem onClick={() => handleForceEnd(gameId, game.title)}>
                  <Power className="mr-2 h-4 w-4" />
                  강제 종료
                </DropdownMenuItem>
          )}
              {canSettle && (
                <DropdownMenuItem onClick={() => handleSettle(gameId, game.title)}>
                  <Calculator className="mr-2 h-4 w-4" />
                  정산
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(gameId, game.title)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
        );
      },
  },
];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="게임 관리"
          description="플랫폼 게임을 관리합니다"
          action={{
            label: '게임 추가',
            icon: Plus,
            onClick: () => setIsCreateDialogOpen(true),
          }}
        />

        {/* 통계 카드 */}
        {!statsLoading && statsData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="총 게임"
              value={data?.totalElements?.toLocaleString() || '0'}
              icon={Gamepad2}
              description="전체 게임 수"
            />
            <StatsCard
              title="활성 게임"
              value={
                data?.content?.filter((g: any) => g.status === 'ACTIVE' || g.status === 'IN_PROGRESS').length || 0
              }
              icon={Trophy}
              description="진행 중인 게임"
            />
            <StatsCard
              title="예정된 게임"
              value={
                data?.content?.filter((g: any) => g.status === 'SCHEDULED' || g.status === 'READY').length || 0
              }
              icon={Gamepad2}
              description="예정된 게임"
            />
            <StatsCard
              title="종료된 게임"
              value={
                data?.content?.filter((g: any) => g.status === 'ENDED' || g.status === 'COMPLETED').length || 0
              }
              icon={Gamepad2}
              description="종료된 게임"
            />
          </div>
        )}

        {/* 필터 바 */}
        <GameFilterBar
          type={typeFilter}
          status={statusFilter}
          category={categoryFilter}
          search={searchQuery}
          startDate={startDate}
          endDate={endDate}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
          onSearchChange={setSearchQuery}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          onReset={handleResetFilters}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState
            icon={Gamepad2}
            title="게임을 불러올 수 없습니다"
            description="로그인 상태를 확인하고 필요한 권한이 있는지 확인해주세요"
          />
        ) : data?.content.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="게임이 없습니다"
            description="필터를 조정하거나 새 게임을 생성하세요"
            action={{
              label: '게임 추가',
              onClick: () => setIsCreateDialogOpen(true),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data?.content || []}
            enableServerSidePagination={true}
            pageCount={data?.totalPages || 0}
            onPaginationChange={(newPage) => {
              setPage(newPage);
            }}
            initialPageSize={10}
          />
        )}

        {/* 다이얼로그들 */}
        <CreateGameDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

        <GameDetailDialog
          gameId={selectedGameId}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          onEdit={() => {
            setDetailDialogOpen(false);
            setEditDialogOpen(true);
          }}
        />

        <EditGameDialog gameId={selectedGameId} open={editDialogOpen} onOpenChange={setEditDialogOpen} />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="게임 삭제"
          description={`정말로 "${selectedGameTitle}" 게임을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleConfirmDelete}
          variant="destructive"
        />

        <ConfirmDialog
          open={forceEndDialogOpen}
          onOpenChange={setForceEndDialogOpen}
          title="게임 강제 종료"
          description={`정말로 "${selectedGameTitle}" 게임을 강제로 종료하시겠습니까?`}
          confirmText="종료"
          cancelText="취소"
          onConfirm={handleConfirmForceEnd}
          variant="destructive"
        />

        <ConfirmDialog
          open={settleDialogOpen}
          onOpenChange={setSettleDialogOpen}
          title="게임 정산"
          description={`"${selectedGameTitle}" 게임을 정산하시겠습니까?`}
          confirmText="정산"
          cancelText="취소"
          onConfirm={handleConfirmSettle}
        />
      </div>
    </AdminLayout>
  );
}
