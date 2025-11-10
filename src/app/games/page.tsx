'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGames } from '@/lib/hooks/use-games';
import { Game, GameStatus } from '@/lib/types/game';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Gamepad2 } from 'lucide-react';

const statusColors: Record<GameStatus, string> = {
  [GameStatus.DRAFT]: 'bg-gray-500',
  [GameStatus.PUBLISHED]: 'bg-green-500',
  [GameStatus.ARCHIVED]: 'bg-orange-500',
  [GameStatus.MAINTENANCE]: 'bg-yellow-500',
};

const columns: ColumnDef<Game>[] = [
  {
    accessorKey: 'title',
    header: 'Game',
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
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.category}</Badge>
    ),
  },
  {
    accessorKey: 'difficulty',
    header: 'Difficulty',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${statusColors[row.original.status]}`} />
        <span className="capitalize">{row.original.status.toLowerCase()}</span>
      </div>
    ),
  },
  {
    accessorKey: 'rewardPoints',
    header: 'Reward',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.rewardPoints} pts</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Edit game</DropdownMenuItem>
          <DropdownMenuItem>View stats</DropdownMenuItem>
          {row.original.status === GameStatus.DRAFT && (
            <DropdownMenuItem>Publish</DropdownMenuItem>
          )}
          {row.original.status === GameStatus.PUBLISHED && (
            <DropdownMenuItem>Archive</DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-red-600">Delete game</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function GamesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useGames({ page, size: 10 });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Games"
          description="Manage your platform games"
          action={{
            label: 'Add Game',
            icon: Plus,
            onClick: () => console.log('Add game'),
          }}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState
            icon={Gamepad2}
            title="Unable to load games"
            description="Please make sure you are logged in and have the required permissions"
          />
        ) : data?.content.length === 0 ? (
          <EmptyState
            icon={Gamepad2}
            title="No games yet"
            description="Get started by creating your first game"
            action={{
              label: 'Add Game',
              onClick: () => console.log('Add game'),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data?.content || []}
            searchKey="title"
            searchPlaceholder="Search games..."
          />
        )}
      </div>
    </AdminLayout>
  );
}
