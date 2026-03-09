'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  Column,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  enableServerSidePagination?: boolean;
  pageCount?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
  initialPageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = '검색...',
  enableServerSidePagination = false,
  pageCount,
  onPaginationChange,
  initialPageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enableServerSidePagination ? undefined : getPaginationRowModel(),
    manualPagination: enableServerSidePagination,
    pageCount: enableServerSidePagination ? pageCount : undefined,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      if (enableServerSidePagination && onPaginationChange) {
        onPaginationChange(newPagination.pageIndex, newPagination.pageSize);
      }
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: enableServerSidePagination ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  });

  const getSortIcon = (column: Column<TData, unknown>) => {
    const sorted = column.getIsSorted();
    if (sorted === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sorted === 'desc') return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchKey && table.getColumn(searchKey) && (
        <div className="flex items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(canSort && 'cursor-pointer select-none hover:bg-muted/50')}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {canSort && getSortIcon(header.column)}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enableServerSidePagination ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            총 {table.getFilteredRowModel().rows.length}개 결과
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = Math.max(0, pagination.pageIndex - 1);
                setPagination({ ...pagination, pageIndex: newPage });
                onPaginationChange?.(newPage, pagination.pageSize);
              }}
              disabled={pagination.pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <div className="flex items-center space-x-1">
              {(() => {
                const currentPage = pagination.pageIndex + 1;
                const totalPages = pageCount || 1;
                const pages: (number | string)[] = [];

                if (totalPages <= 7) {
                  // 7페이지 이하면 모든 페이지 번호 표시
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // 첫 페이지
                  pages.push(1);

                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  // 현재 페이지 주변
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);

                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }

                  // 마지막 페이지
                  pages.push(totalPages);
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }

                  const pageNum = page as number;
                  const isActive = pageNum === currentPage;

                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className={isActive ? '' : 'min-w-[40px]'}
                      onClick={() => {
                        const newPage = pageNum - 1;
                        setPagination({ ...pagination, pageIndex: newPage });
                        onPaginationChange?.(newPage, pagination.pageSize);
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                });
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPage = pagination.pageIndex + 1;
                setPagination({ ...pagination, pageIndex: newPage });
                onPaginationChange?.(newPage, pagination.pageSize);
              }}
              disabled={pageCount ? pagination.pageIndex >= pageCount - 1 : false}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length > 0 ? (
              <>
                {table.getFilteredRowModel().rows.length}개 중 {table.getRowModel().rows.length}개 표시
              </>
            ) : (
              '결과가 없습니다'
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <div className="flex items-center space-x-1">
              {(() => {
                const currentPage = table.getState().pagination.pageIndex + 1;
                const totalPages = table.getPageCount();
                const pages: (number | string)[] = [];

                if (totalPages <= 7) {
                  // 7페이지 이하면 모든 페이지 번호 표시
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // 첫 페이지
                  pages.push(1);

                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  // 현재 페이지 주변
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);

                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }

                  // 마지막 페이지
                  pages.push(totalPages);
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }

                  const pageNum = page as number;
                  const isActive = pageNum === currentPage;

                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className={isActive ? '' : 'min-w-[40px]'}
                      onClick={() => table.setPageIndex(pageNum - 1)}
                    >
                      {pageNum}
                    </Button>
                  );
                });
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
