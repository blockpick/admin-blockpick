'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserFilterBar } from '@/components/features/user-filter-bar';
import { CreateUserDialog } from '@/components/features/create-user-dialog';
import { UserDetailDialog } from '@/components/features/user-detail-dialog';
import { EditUserDialog } from '@/components/features/edit-user-dialog';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import { useUsers, useDeleteUser, useUpdateUserRole, useUserStats } from '@/lib/hooks/use-users';
import { UserModel, UserStatus } from '@/lib/types/user';
import { UserRole } from '@/lib/types/auth';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, UserPlus, Users, Shield, UserCheck, UserX, UserCog } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusColors: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'bg-green-500',
  [UserStatus.INACTIVE]: 'bg-gray-500',
  [UserStatus.SUSPENDED]: 'bg-red-500',
  [UserStatus.DELETED]: 'bg-black',
};

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>();
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const { toast } = useToast();
  const { data, isLoading, error } = useUsers({
    page,
    size: 10,
    status: statusFilter,
    role: roleFilter,
    search: searchQuery || undefined,
    startDate,
    endDate,
  });
  const { data: statsData, isLoading: statsLoading } = useUserStats();
  const deleteUser = useDeleteUser();
  const updateUserRole = useUpdateUserRole();

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setDetailDialogOpen(true);
  };

  const handleEdit = (userId: string) => {
    setSelectedUserId(userId);
    setEditDialogOpen(true);
  };

  const handleDelete = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;

    try {
      await deleteUser.mutateAsync(selectedUserId);
      toast({
        title: '사용자 삭제 성공',
        description: '사용자가 성공적으로 삭제되었습니다.',
      });
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    } catch (error) {
      toast({
        title: '사용자 삭제 실패',
        description: error instanceof Error ? error.message : '사용자 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleChangeRole = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setRoleChangeDialogOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUserEmail) return;

    try {
      const result = await updateUserRole.mutateAsync({
        email: selectedUserEmail,
        role: newRole,
      });
      toast({
        title: '역할 변경 성공',
        description: `사용자 역할이 ${newRole}로 변경되었습니다.`,
      });
      setRoleChangeDialogOpen(false);
      setSelectedUserId(null);
      setSelectedUserEmail('');
    } catch (error) {
      toast({
        title: '역할 변경 실패',
        description: error instanceof Error ? error.message : '역할 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleResetFilters = () => {
    setStatusFilter(undefined);
    setRoleFilter(undefined);
    setSearchQuery('');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const columns: ColumnDef<UserModel>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            {(row.original.name || row.original.nickname || row.original.email || 'U')
              .charAt(0)
              .toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{row.original.username || row.original.email}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => row.original.name || row.original.nickname || '-',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.userRole || 'USER'}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || 'ACTIVE';
        return (
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${statusColors[status] || 'bg-gray-400'}`} />
            <span className="capitalize">{status.toLowerCase()}</span>
          </div>
        );
      },
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
            <DropdownMenuItem onClick={() => handleViewDetails(row.original.id)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
              Edit user
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeRole(row.original.id, row.original.email)}>
              <Shield className="mr-2 h-4 w-4" />
              Change role
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(row.original.id, row.original.email)}
            >
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage your platform users"
          action={{
            label: 'Add User',
            icon: UserPlus,
            onClick: () => setCreateDialogOpen(true),
          }}
        />

        {/* 통계 카드 */}
        {!statsLoading && statsData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="총 사용자"
              value={statsData.total?.toLocaleString() || '0'}
              icon={Users}
              description="전체 등록 사용자"
            />
            <StatsCard
              title="활성 사용자"
              value={statsData.active?.toLocaleString() || '0'}
              icon={UserCheck}
              description={`비활성: ${statsData.inactive?.toLocaleString() || '0'}`}
            />
            <StatsCard
              title="정지된 사용자"
              value={statsData.banned?.toLocaleString() || '0'}
              icon={UserX}
              description="정지된 계정"
            />
            <StatsCard
              title="비활성 사용자"
              value={statsData.inactive?.toLocaleString() || '0'}
              icon={UserCog}
              description="비활성 계정"
            />
          </div>
        )}

        {/* 필터 바 */}
        <UserFilterBar
          status={statusFilter}
          role={roleFilter}
          search={searchQuery}
          startDate={startDate}
          endDate={endDate}
          onStatusChange={setStatusFilter}
          onRoleChange={setRoleFilter}
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
            icon={Users}
            title="Unable to load users"
            description="Please make sure you are logged in and have the required permissions"
          />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your filters or create a new user"
            action={{
              label: 'Add User',
              onClick: () => setCreateDialogOpen(true),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            searchKey="email"
            searchPlaceholder="Search users..."
          />
        )}

        {/* 다이얼로그들 */}
        <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

        <UserDetailDialog
          userId={selectedUserId}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          onEdit={() => {
            setDetailDialogOpen(false);
            setEditDialogOpen(true);
          }}
        />

        <EditUserDialog
          userId={selectedUserId}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="사용자 삭제"
          description={`정말로 ${selectedUserEmail} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleConfirmDelete}
          variant="destructive"
        />

        <ConfirmDialog
          open={roleChangeDialogOpen}
          onOpenChange={setRoleChangeDialogOpen}
          title="역할 변경"
          description={
            <div className="space-y-4">
              <p>{selectedUserEmail} 사용자의 역할을 변경합니다.</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">새 역할 선택</label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.USER}>USER</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>ADMIN</SelectItem>
                    <SelectItem value={UserRole.PARTNER}>PARTNER</SelectItem>
                    <SelectItem value={UserRole.SUPER_ADMIN}>SUPER_ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
          confirmText="변경"
          cancelText="취소"
          onConfirm={handleConfirmRoleChange}
        />
      </div>
    </AdminLayout>
  );
}
