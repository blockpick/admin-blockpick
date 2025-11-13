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
import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductFilterBarProps {
  brand?: string;
  category?: string;
  active?: boolean;
  search?: string;
  onBrandChange: (brand: string | undefined) => void;
  onCategoryChange: (category: string | undefined) => void;
  onActiveChange: (active: boolean | undefined) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  brands?: string[];
  categories?: string[];
}

export function ProductFilterBar({
  brand,
  category,
  active,
  search,
  onBrandChange,
  onCategoryChange,
  onActiveChange,
  onSearchChange,
  onReset,
  brands = [],
  categories = [],
}: ProductFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = brand || category || active !== undefined;

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 토글 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="상품명, SKU, 브랜드로 검색..."
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
              {[brand, category, active !== undefined].filter(Boolean).length}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="brand-filter">브랜드</Label>
            <Select value={brand || 'all'} onValueChange={(value) => onBrandChange(value === 'all' ? undefined : value)}>
              <SelectTrigger id="brand-filter">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-filter">카테고리</Label>
            <Select value={category || 'all'} onValueChange={(value) => onCategoryChange(value === 'all' ? undefined : value)}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="active-filter">상태</Label>
            <Select value={active === undefined ? 'all' : active ? 'active' : 'inactive'} onValueChange={(value) => onActiveChange(value === 'all' ? undefined : value === 'active')}>
              <SelectTrigger id="active-filter">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {brand && (
            <Badge variant="secondary" className="gap-1">
              브랜드: {brand}
              <button
                onClick={() => onBrandChange(undefined)}
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
          {active !== undefined && (
            <Badge variant="secondary" className="gap-1">
              상태: {active ? '활성' : '비활성'}
              <button
                onClick={() => onActiveChange(undefined)}
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

