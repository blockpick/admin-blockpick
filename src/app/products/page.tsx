'use client';

import { useState, useEffect } from 'react';
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
import { ProductFilterBar } from '@/components/features/product-filter-bar';
import { CreateProductDialog } from '@/components/features/create-product-dialog';
import { ProductDetailDialog } from '@/components/features/product-detail-dialog';
import { EditProductDialog } from '@/components/features/edit-product-dialog';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import { useProducts, useDeleteProduct, useProductStats } from '@/lib/hooks/use-products';
import { ProductDto } from '@/lib/types/product';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, PackagePlus, Package, Tag, Hash, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { productService } from '@/lib/api';

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');

  // 필터 상태
  const [brandFilter, setBrandFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 브랜드 및 카테고리 목록
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const { toast } = useToast();
  const { data, isLoading, error } = useProducts({
    page,
    size: 10,
    brand: brandFilter,
    category: categoryFilter,
    active: activeFilter,
    search: searchQuery || undefined,
  });
  const { data: statsData, isLoading: statsLoading, error: statsError } = useProductStats();
  const deleteProduct = useDeleteProduct();

  // 브랜드 및 카테고리 목록 로드
  useEffect(() => {
    const loadFilters = async () => {
      try {
        // 브랜드 목록은 현재 페이지의 상품에서 추출 (점진적으로 로드)
        // 카테고리만 별도 API로 로드
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts({ page: 0, size: 100 }).catch((err) => {
            console.warn('Failed to load products for brand filter:', err);
            return null;
          }),
          productService.getCategories().catch((err) => {
            // 400 에러는 API가 아직 구현되지 않았을 수 있으므로 경고만 출력
            console.warn('Failed to load categories (API may not be implemented):', err);
            return [];
          }),
        ]);

        if (productsData?.content) {
          const uniqueBrands = new Set<string>();
          productsData.content.forEach((p) => {
            if (p.brand) uniqueBrands.add(p.brand);
          });
          setBrands(Array.from(uniqueBrands));
        }

        if (categoriesData && Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to load filters:', error);
        // 필터 로딩 실패는 페이지 전체에 영향을 주지 않도록 함
        // 빈 배열로 초기화하여 UI가 정상 작동하도록 함
        setBrands([]);
        setCategories([]);
      }
    };
    loadFilters();
  }, []);

  const handleViewDetails = (productId: string) => {
    setSelectedProductId(productId);
    setDetailDialogOpen(true);
  };

  const handleEdit = (productId: string) => {
    setSelectedProductId(productId);
    setEditDialogOpen(true);
  };

  const handleDelete = (productId: string, name: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(name);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductId) return;

    try {
      await deleteProduct.mutateAsync(selectedProductId);
      toast({
        title: '상품 삭제 성공',
        description: '상품이 성공적으로 삭제되었습니다.',
      });
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
    } catch (error) {
      toast({
        title: '상품 삭제 실패',
        description: error instanceof Error ? error.message : '상품 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleResetFilters = () => {
    setBrandFilter(undefined);
    setCategoryFilter(undefined);
    setActiveFilter(undefined);
    setSearchQuery('');
  };

  const columns: ColumnDef<ProductDto>[] = [
    {
      accessorKey: 'image',
      header: '이미지',
      cell: ({ row }) => {
        const product = row.original;
        const imageUrl = product.thumbnailUrl || product.thumbnail || product.imageUrl || product.defaultImage;
        return (
          <div className="h-12 w-12 rounded-lg overflow-hidden border flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: '상품명',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'brand',
      header: '브랜드',
      cell: ({ row }) => row.original.brand || '-',
    },
    {
      accessorKey: 'category',
      header: '카테고리',
      cell: ({ row }) => row.original.category || '-',
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => row.original.sku || '-',
    },
    {
      accessorKey: 'price',
      header: '가격',
      cell: ({ row }) => {
        const product = row.original;
        if (product.price !== undefined && product.price !== null && typeof product.price === 'number') {
          return `${product.price.toLocaleString()} ${product.countryCode || 'KRW'}`;
        }
        return '-';
      },
    },
    {
      accessorKey: 'active',
      header: '상태',
      cell: ({ row }) => {
        const active = row.original.active;
        return (
          <Badge variant={active ? 'default' : 'secondary'}>
            {active ? '활성' : '비활성'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '생성일',
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
              상세보기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDelete(row.original.id, row.original.name)}
            >
              삭제
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
          title="Products"
          description="상품을 관리합니다"
          action={{
            label: 'Add Product',
            icon: PackagePlus,
            onClick: () => setCreateDialogOpen(true),
          }}
        />

        {/* 통계 카드 */}
        {!statsLoading && statsData && !statsError && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="총 상품 수"
              value={statsData.total?.toLocaleString() || '0'}
              icon={Package}
              description="전체 등록 상품"
            />
            <StatsCard
              title="활성 상품"
              value={statsData.active?.toLocaleString() || '0'}
              icon={Package}
              description={`비활성: ${statsData.inactive?.toLocaleString() || '0'}`}
            />
            <StatsCard
              title="브랜드 수"
              value={Object.keys(statsData.byBrand || {}).length.toLocaleString()}
              icon={Tag}
              description="등록된 브랜드"
            />
            <StatsCard
              title="카테고리 수"
              value={Object.keys(statsData.byCategory || {}).length.toLocaleString()}
              icon={Hash}
              description="등록된 카테고리"
            />
          </div>
        )}

        {/* 필터 바 */}
        <ProductFilterBar
          brand={brandFilter}
          category={categoryFilter}
          active={activeFilter}
          search={searchQuery}
          onBrandChange={setBrandFilter}
          onCategoryChange={setCategoryFilter}
          onActiveChange={setActiveFilter}
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
          brands={brands}
          categories={categories}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState
            icon={Package}
            title="상품을 불러올 수 없습니다"
            description="로그인 상태를 확인하고 다시 시도해주세요"
          />
        ) : data?.content.length === 0 ? (
          <EmptyState
            icon={Package}
            title="상품이 없습니다"
            description="필터를 조정하거나 새 상품을 생성하세요"
            action={{
              label: 'Add Product',
              onClick: () => setCreateDialogOpen(true),
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data?.content || []}
            searchKey="name"
            searchPlaceholder="상품 검색..."
          />
        )}

        {/* 다이얼로그들 */}
        <CreateProductDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

        <ProductDetailDialog
          productId={selectedProductId}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          onEdit={() => {
            setDetailDialogOpen(false);
            setEditDialogOpen(true);
          }}
        />

        <EditProductDialog
          productId={selectedProductId}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="상품 삭제"
          description={`정말로 "${selectedProductName}" 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleConfirmDelete}
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
}

