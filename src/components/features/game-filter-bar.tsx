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
import { GameType, GameStatusType } from '@/lib/types/game';
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameFilterBarProps {
  type?: GameType;
  status?: GameStatusType;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  onTypeChange: (type: GameType | undefined) => void;
  onStatusChange: (status: GameStatusType | undefined) => void;
  onCategoryChange: (category: string | undefined) => void;
  onSearchChange: (search: string) => void;
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void;
  onReset: () => void;
}

export function GameFilterBar({
  type,
  status,
  category,
  search,
  startDate,
  endDate,
  onTypeChange,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
  onDateRangeChange,
  onReset,
}: GameFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = type || status || category || startDate || endDate;

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 토글 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="게임 제목으로 검색..."
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
              {[type, status, category, startDate, endDate].filter(Boolean).length}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="type-filter">타입</Label>
            <Select value={type || 'all'} onValueChange={(value) => onTypeChange(value === 'all' ? undefined : (value as GameType))}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="DAILY">DAILY</SelectItem>
                <SelectItem value="SELECT">SELECT</SelectItem>
                <SelectItem value="VIBE">VIBE</SelectItem>
                <SelectItem value="PRIME">프라임</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">상태</Label>
            <Select value={status || 'all'} onValueChange={(value) => onStatusChange(value === 'all' ? undefined : (value as GameStatusType))}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="READY">READY</SelectItem>
                <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                <SelectItem value="PAUSED">PAUSED</SelectItem>
                <SelectItem value="SETTLING">SETTLING</SelectItem>
                <SelectItem value="ENDED">ENDED</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="FAILED">FAILED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-filter">카테고리</Label>
            <Input
              id="category-filter"
              placeholder="카테고리"
              value={category || ''}
              onChange={(e) => onCategoryChange(e.target.value || undefined)}
            />
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
          {type && (
            <Badge variant="secondary" className="gap-1">
              타입: {type}
              <button
                onClick={() => onTypeChange(undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
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
          {category && (
            <Badge variant="secondary" className="gap-1">
              카테고리: {category}
              <button
                onClick={() => onCategoryChange(undefined)}
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

