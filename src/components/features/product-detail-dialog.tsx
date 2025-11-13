'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProduct } from '@/lib/hooks/use-products';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Package, Calendar, Tag, Hash } from 'lucide-react';
import Image from 'next/image';

interface ProductDetailDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export function ProductDetailDialog({
  productId,
  open,
  onOpenChange,
  onEdit,
}: ProductDetailDialogProps) {
  const { data, isLoading, error } = useProduct(productId || '');

  if (!productId) return null;

  const product = data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상품 상세 정보</DialogTitle>
          <DialogDescription>상품의 상세 정보를 확인합니다.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !product ? (
          <div className="text-center py-8 text-muted-foreground">
            상품 정보를 불러올 수 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {/* 이미지 섹션 */}
            <div className="flex items-start gap-4">
              {product.thumbnailUrl || product.thumbnail ? (
                <div className="relative h-32 w-32 rounded-lg overflow-hidden border flex-shrink-0">
                  <Image
                    src={product.thumbnailUrl || product.thumbnail || ''}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : product.imageUrl || product.defaultImage ? (
                <div className="relative h-32 w-32 rounded-lg overflow-hidden border flex-shrink-0">
                  <Image
                    src={product.imageUrl || product.defaultImage || ''}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-lg border border-dashed flex items-center justify-center bg-muted flex-shrink-0">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  {product.active !== undefined && (
                    <Badge variant={product.active ? 'default' : 'secondary'}>
                      {product.active ? '활성' : '비활성'}
                    </Badge>
                  )}
                </div>
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* 기본 정보 */}
            <div className="space-y-4">
              <h4 className="font-medium">기본 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                {product.brand && (
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      브랜드
                    </div>
                    <p className="font-medium">{product.brand}</p>
                  </div>
                )}
                {product.sku && (
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      SKU
                    </div>
                    <p className="font-medium">{product.sku}</p>
                  </div>
                )}
                {product.category && (
                  <div>
                    <div className="text-sm text-muted-foreground">카테고리</div>
                    <p className="font-medium">{product.category}</p>
                  </div>
                )}
                {product.price !== undefined && (
                  <div>
                    <div className="text-sm text-muted-foreground">가격</div>
                    <p className="font-medium">
                      {product.price.toLocaleString()} {product.countryCode || 'KRW'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 날짜 정보 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                생성일
              </div>
              <p className="text-sm">
                {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
              </p>
              {product.updatedAt && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                    <Calendar className="h-4 w-4" />
                    수정일
                  </div>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(product.updatedAt), { addSuffix: true })}
                  </p>
                </>
              )}
            </div>

            {/* 메타데이터 */}
            {product.metadata && Object.keys(product.metadata).length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">메타데이터</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                    {JSON.stringify(product.metadata, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {/* 액션 버튼 */}
            {onEdit && (
              <>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    닫기
                  </Button>
                  <Button onClick={onEdit}>수정</Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

