'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserStatus } from '@/lib/types/user';
import { UserRole } from '@/lib/types/auth';
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserFilterBarProps {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  startDate?: string;
  endDate?: string;
  onStatusChange: (status: UserStatus | undefined) => void;
  onRoleChange: (role: UserRole | undefined) => void;
  onSearchChange: (search: string) => void;
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void;
  onReset: () => void;
}

export function UserFilterBar({
  status,
  role,
  search,
  startDate,
  endDate,
  onStatusChange,
  onRoleChange,
  onSearchChange,
  onDateRangeChange,
  onReset,
}: UserFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = status || role || startDate || endDate;

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 토글 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="이메일 또는 닉네임으로 검색..."
            value={search || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={hasActiveFilters ? 'border-primary' : ''}
        >
          <Filter className="mr-2 h-4 w-4" />
          필터
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {[status, role, startDate, endDate].filter(Boolean).length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 확장된 필터 옵션 */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="status-filter">상태</Label>
            <Select value={status || 'all'} onValueChange={(value) => onStatusChange(value === 'all' ? undefined : (value as UserStatus))}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value={UserStatus.ACTIVE}>활성</SelectItem>
                <SelectItem value={UserStatus.INACTIVE}>비활성</SelectItem>
                <SelectItem value={UserStatus.SUSPENDED}>정지됨</SelectItem>
                <SelectItem value={UserStatus.DELETED}>삭제됨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-filter">역할</Label>
            <Select value={role || 'all'} onValueChange={(value) => onRoleChange(value === 'all' ? undefined : (value as UserRole))}>
              <SelectTrigger id="role-filter">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value={UserRole.USER}>USER</SelectItem>
                <SelectItem value={UserRole.ADMIN}>ADMIN</SelectItem>
                <SelectItem value={UserRole.PARTNER}>PARTNER</SelectItem>
                <SelectItem value={UserRole.SUPER_ADMIN}>SUPER_ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">시작일</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate || ''}
              onChange={(e) => onDateRangeChange(e.target.value || undefined, endDate)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">종료일</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate || ''}
              onChange={(e) => onDateRangeChange(startDate, e.target.value || undefined)}
            />
          </div>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {status && (
            <Badge variant="secondary" className="gap-1">
              상태: {status}
              <button
                onClick={() => onStatusChange(undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {role && (
            <Badge variant="secondary" className="gap-1">
              역할: {role}
              <button
                onClick={() => onRoleChange(undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {startDate && (
            <Badge variant="secondary" className="gap-1">
              시작일: {startDate}
              <button
                onClick={() => onDateRangeChange(undefined, endDate)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {endDate && (
            <Badge variant="secondary" className="gap-1">
              종료일: {endDate}
              <button
                onClick={() => onDateRangeChange(startDate, undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

