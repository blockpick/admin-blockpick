'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { useLinkProductToGame, useProducts } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateProductDialog } from './create-product-dialog';

const linkProductFormSchema = z.object({
  productId: z.string().min(1, '상품을 선택해주세요'),
  isGrandPrize: z.boolean(),
  quantity: z.number().optional(),
  sequence: z.number().optional(),
  active: z.boolean(),
});

type LinkProductFormValues = z.infer<typeof linkProductFormSchema>;

interface LinkProductToGameDialogProps {
  gameId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkProductToGameDialog({
  gameId,
  open,
  onOpenChange,
}: LinkProductToGameDialogProps) {
  const { toast } = useToast();
  const linkProduct = useLinkProductToGame();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 0,
    size: 50,
    search: searchQuery || undefined,
  });

  const form = useForm<LinkProductFormValues>({
    resolver: zodResolver(linkProductFormSchema),
    defaultValues: {
      productId: '',
      isGrandPrize: false,
      quantity: undefined,
      sequence: undefined,
      active: true,
    },
  });

  const onSubmit = async (data: LinkProductFormValues) => {
    setIsSubmitting(true);
    try {
      await linkProduct.mutateAsync({
        gameId,
        productId: data.productId,
        request: {
          gameProduct: {
            gameId,
            productId: data.productId,
            isGrandPrize: data.isGrandPrize,
            quantity: data.quantity,
            sequence: data.sequence,
            active: data.active,
          },
          regions: [], // 지역 설정은 별도 다이얼로그에서 처리
        },
      });

      toast({
        title: '상품 연결 성공',
        description: '상품이 게임에 성공적으로 연결되었습니다.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: '상품 연결 실패',
        description: error instanceof Error ? error.message : '상품 연결 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = productsData?.content.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>상품 연결</DialogTitle>
            <DialogDescription>
              기존 상품을 게임에 연결하거나 새 상품을 생성하여 연결합니다.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">기존 상품 선택</TabsTrigger>
              <TabsTrigger value="new">새 상품 생성</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* 상품 검색 */}
                <div className="space-y-2">
                  <Label>상품 검색</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="상품명으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* 상품 선택 */}
                <div className="space-y-2">
                  <Label htmlFor="productId">
                    상품 선택 <span className="text-red-500">*</span>
                  </Label>
                  {productsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Select
                      value={form.watch('productId')}
                      onValueChange={(value) => form.setValue('productId', value)}
                    >
                      <SelectTrigger id="productId">
                        <SelectValue placeholder="상품을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts && filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} {product.brand && `(${product.brand})`}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-products" disabled>
                            상품이 없습니다
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {form.formState.errors.productId && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.productId.message}
                    </p>
                  )}
                </div>

                {/* 게임 상품 설정 */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">게임 상품 설정</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">수량</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        {...form.register('quantity', { valueAsNumber: true })}
                        placeholder="선택사항"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sequence">순서</Label>
                      <Input
                        id="sequence"
                        type="number"
                        min="1"
                        {...form.register('sequence', { valueAsNumber: true })}
                        placeholder="선택사항"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isGrandPrize">그랜드 프라이즈</Label>
                      <p className="text-sm text-muted-foreground">
                        이 상품을 그랜드 프라이즈로 설정합니다
                      </p>
                    </div>
                    <Switch
                      id="isGrandPrize"
                      checked={form.watch('isGrandPrize')}
                      onCheckedChange={(checked) => form.setValue('isGrandPrize', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="active">활성화</Label>
                      <p className="text-sm text-muted-foreground">
                        게임에서 이 상품을 활성화합니다
                      </p>
                    </div>
                    <Switch
                      id="active"
                      checked={form.watch('active')}
                      onCheckedChange={(checked) => form.setValue('active', checked)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setSearchQuery('');
                      onOpenChange(false);
                    }}
                    disabled={isSubmitting}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        연결 중...
                      </>
                    ) : (
                      '상품 연결'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  새 상품을 생성하고 게임에 연결합니다. 상품 생성 후 연결 설정을 진행할 수 있습니다.
                </p>
                <Button
                  onClick={() => {
                    setCreateProductDialogOpen(true);
                  }}
                  className="w-full"
                >
                  새 상품 생성
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CreateProductDialog
        open={createProductDialogOpen}
        onOpenChange={setCreateProductDialogOpen}
      />
    </>
  );
}

