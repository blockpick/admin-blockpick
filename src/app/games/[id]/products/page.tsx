'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useGame,
  useGameProductStats,
  useCompleteGameProducts,
  useDeleteGameProduct,
  useSetGrandPrizes,
} from '@/lib/hooks/use-game-products';
import { PackagePlus, Package, Trophy, Globe, MoreHorizontal, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/features/confirm-dialog';
import { LinkProductToGameDialog } from '@/components/features/link-product-to-game-dialog';

export default function GameProductsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');

  const { data: game, isLoading: gameLoading } = useGame(gameId);
  const { data: products, isLoading: productsLoading } = useCompleteGameProducts(gameId);
  const { data: stats, isLoading: statsLoading } = useGameProductStats(gameId);
  const deleteProduct = useDeleteGameProduct();
  const setGrandPrizes = useSetGrandPrizes();

  const handleDelete = (productId: string, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductId) return;

    try {
      await deleteProduct.mutateAsync(selectedProductId);
      toast({
        title: '상품 삭제 성공',
        description: '게임에서 상품이 성공적으로 제거되었습니다.',
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

  const handleToggleGrandPrize = async (productId: string, currentStatus: boolean) => {
    try {
      const grandPrizeIds = products
        ?.filter((p) => (p.id === productId ? !currentStatus : p.isGrandPrize))
        .map((p) => p.id) || [];

      await setGrandPrizes.mutateAsync({
        gameId,
        request: { gameProductIds: grandPrizeIds },
      });

      toast({
        title: '그랜드 프라이즈 설정 완료',
        description: currentStatus
          ? '그랜드 프라이즈에서 제거되었습니다.'
          : '그랜드 프라이즈로 설정되었습니다.',
      });
    } catch (error) {
      toast({
        title: '설정 실패',
        description: error instanceof Error ? error.message : '그랜드 프라이즈 설정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (gameLoading || productsLoading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!game) {
    return (
      <AdminLayout>
        <EmptyState
          icon={Package}
          title="게임을 찾을 수 없습니다"
          description="게임 정보를 불러올 수 없습니다."
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/games')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={`${game.title} - 상품 관리`}
            description="게임에 연결된 상품을 관리합니다"
            action={{
              label: 'Add Product',
              icon: PackagePlus,
              onClick: () => setLinkDialogOpen(true),
            }}
          />
        </div>

        {/* 통계 카드 */}
        {!statsLoading && stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
              title="총 상품 수"
              value={stats.total?.toLocaleString() || '0'}
              icon={Package}
              description={`활성: ${stats.active?.toLocaleString() || '0'}`}
            />
            <StatsCard
              title="그랜드 프라이즈"
              value={stats.grandPrizes?.toLocaleString() || '0'}
              icon={Trophy}
              description="그랜드 프라이즈 상품"
            />
            <StatsCard
              title="지역 수"
              value={Object.keys(stats.byRegion || {}).length.toLocaleString()}
              icon={Globe}
              description="설정된 지역"
            />
          </div>
        )}

        {/* 상품 목록 */}
        {products && products.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => {
              const productData = product.product;
              const imageUrl =
                productData?.thumbnailUrl ||
                productData?.thumbnail ||
                productData?.imageUrl ||
                productData?.defaultImage;

              return (
                <Card key={product.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {imageUrl ? (
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden border flex-shrink-0">
                          <Image
                            src={imageUrl}
                            alt={productData?.name || '상품'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg border border-dashed flex items-center justify-center bg-muted flex-shrink-0">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                #{product.sequence || index + 1}
                              </span>
                              {product.isGrandPrize && (
                                <Badge variant="default" className="text-xs">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  그랜드 프라이즈
                                </Badge>
                              )}
                              {!product.active && (
                                <Badge variant="secondary" className="text-xs">
                                  비활성
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-sm truncate">
                              {productData?.name || '상품명 없음'}
                            </h4>
                            {productData?.brand && (
                              <p className="text-xs text-muted-foreground truncate">
                                {productData.brand}
                              </p>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleGrandPrize(product.id, product.isGrandPrize)
                                }
                              >
                                <Trophy className="mr-2 h-4 w-4" />
                                {product.isGrandPrize
                                  ? '그랜드 프라이즈 해제'
                                  : '그랜드 프라이즈 설정'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // TODO: 지역 설정 다이얼로그 열기
                                  toast({
                                    title: '준비 중',
                                    description: '지역 설정 기능은 곧 제공될 예정입니다.',
                                  });
                                }}
                              >
                                <Globe className="mr-2 h-4 w-4" />
                                지역 설정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDelete(product.id, productData?.name || '상품')
                                }
                              >
                                상품 제거
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {product.quantity !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            수량: {product.quantity}
                          </p>
                        )}

                        {product.regions && product.regions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {product.regions.slice(0, 3).map((region) => (
                              <Badge key={region.id} variant="outline" className="text-xs">
                                {region.countryCode || region.regionCode || '지역'}
                              </Badge>
                            ))}
                            {product.regions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.regions.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="연결된 상품이 없습니다"
            description="게임에 상품을 추가하여 시작하세요"
            action={{
              label: 'Add Product',
              onClick: () => setLinkDialogOpen(true),
            }}
          />
        )}

        {/* 상품 연결 다이얼로그 */}
        <LinkProductToGameDialog
          gameId={gameId}
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
        />

        {/* 삭제 확인 다이얼로그 */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="상품 제거"
          description={`정말로 "${selectedProductName}" 상품을 게임에서 제거하시겠습니까?`}
          confirmText="제거"
          cancelText="취소"
          onConfirm={handleConfirmDelete}
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
}

