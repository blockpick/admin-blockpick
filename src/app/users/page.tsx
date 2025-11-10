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
import { useUsers } from '@/lib/hooks/use-users';
import { UserModel, UserStatus } from '@/lib/types/user';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, UserPlus, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'bg-green-500',
  [UserStatus.INACTIVE]: 'bg-gray-500',
  [UserStatus.SUSPENDED]: 'bg-red-500',
  [UserStatus.DELETED]: 'bg-black',
};

const columns: ColumnDef<UserModel>[] = [
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium">{row.original.username}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.role}</Badge>
    ),
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
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
      </span>
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
          <DropdownMenuItem>Edit user</DropdownMenuItem>
          <DropdownMenuItem>Suspend user</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">Delete user</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useUsers({ page, size: 10 });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage your platform users"
          action={{
            label: 'Add User',
            icon: UserPlus,
            onClick: () => console.log('Add user'),
          }}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState
            icon={Users}
            title="Unable to load users"
            description="Please make sure you are logged in and have the required permissions"
          />
        ) : data?.content.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Get started by creating your first user"
            action={{
              label: 'Add User',
              onClick: () => console.log('Add user'),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data?.content || []}
            searchKey="username"
            searchPlaceholder="Search users..."
          />
        )}
      </div>
    </AdminLayout>
  );
}
