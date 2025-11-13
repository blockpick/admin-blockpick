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
import { useCreateGame } from '@/lib/hooks/use-games';
import { useProducts } from '@/lib/hooks/use-products';
import { gameProductService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { GameType, Currency } from '@/lib/types/game';
import type { ProductDto } from '@/lib/types/product';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const gameFormSchema = z.object({
  title: z.string().min(1, '게임 제목을 입력해주세요'),
  description: z.string().optional(),
  mainProductName: z.string().optional(),
  type: z.enum(['DAILY', 'SELECT', 'VIBE']),
  category: z.string().optional(),
  entryFee: z.number().min(0, '참가비는 0 이상이어야 합니다'),
  currency: z.enum(['CASH', 'POINT']),
  minEntries: z.number().min(1, '최소 참가 인원은 1명 이상이어야 합니다'),
  maxEntries: z.number().optional(),
  maxEntriesPerUser: z.number().min(1, '사용자당 최대 참가 횟수는 1 이상이어야 합니다'),
  rewardPoint: z.number().optional(),
  gridRows: z.number().optional(),
  gridCols: z.number().optional(),
  visibleFrom: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  allowDuplicate: z.boolean(),
  enableNotification: z.boolean(),
  isRecommended: z.boolean(),
  customRules: z.string().optional(),
  autoEndOnMax: z.boolean(),
  autoEndOnTime: z.boolean(),
  deployContract: z.boolean(),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface CreateGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2;

export function CreateGameDialog({ open, onOpenChange }: CreateGameDialogProps) {
  const { toast } = useToast();
  const createGame = useCreateGame();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // 상품 목록 조회
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    page: 0,
    size: 100,
    active: true,
  });

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      description: '',
      mainProductName: '',
      type: 'DAILY',
      category: '',
      entryFee: 0,
      currency: 'POINT',
      minEntries: 1,
      maxEntries: undefined,
      maxEntriesPerUser: 1,
      rewardPoint: undefined,
      gridRows: undefined,
      gridCols: undefined,
      visibleFrom: '',
      startTime: '',
      endTime: '',
      allowDuplicate: false,
      enableNotification: true,
      isRecommended: false,
      customRules: '',
      autoEndOnMax: false,
      autoEndOnTime: false,
      deployContract: false,
    },
  });

  // 다이얼로그가 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setCreatedGameId(null);
      setSelectedProducts(new Set());
      setProductSearchQuery('');
      form.reset();
    }
  }, [open, form]);

  // Step 1: 게임 생성
  const onStep1Submit = async (data: GameFormValues) => {
    setIsSubmitting(true);
    try {
      const { deployContract, ...gameInput } = data;

      // 빈 문자열을 undefined로 변환
      const cleanedGameInput = {
        ...gameInput,
        description: gameInput.description || undefined,
        mainProductName: gameInput.mainProductName || undefined,
        category: gameInput.category || undefined,
        maxEntries: gameInput.maxEntries || undefined,
        rewardPoint: gameInput.rewardPoint || undefined,
        gridRows: gameInput.gridRows || undefined,
        gridCols: gameInput.gridCols || undefined,
        visibleFrom: gameInput.visibleFrom || undefined,
        startTime: gameInput.startTime || undefined,
        endTime: gameInput.endTime || undefined,
        customRules: gameInput.customRules || undefined,
      };

      const result = await createGame.mutateAsync({
        gameInput: cleanedGameInput,
        deployContract,
      });

      if (result.success && result.game?.id) {
        setCreatedGameId(result.game.id);
        setCurrentStep(2);
        toast({
          title: '게임 생성 완료',
          description: '이제 상품을 연결해주세요.',
        });
      } else {
        toast({
          title: '게임 생성 실패',
          description: result.message || '게임 생성에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류 발생',
        description: error instanceof Error ? error.message : '게임 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: 상품 연결
  const onStep2Submit = async () => {
    if (!createdGameId || selectedProducts.size === 0) {
      toast({
        title: '상품 선택 필요',
        description: '최소 1개 이상의 상품을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const productArray = Array.from(selectedProducts);
      const linkPromises = productArray.map((productId, index) =>
        gameProductService.linkExistingProductToGame(createdGameId, productId, {
          gameProduct: {
            gameId: createdGameId,
            productId,
            isGrandPrize: false,
            sequence: index + 1,
            active: true,
          },
          regions: [],
        })
      );

      await Promise.all(linkPromises);

      toast({
        title: '상품 연결 완료',
        description: `${selectedProducts.size}개의 상품이 게임에 연결되었습니다.`,
      });

      // 완료 후 다이얼로그 닫기
      form.reset();
      setCurrentStep(1);
      setCreatedGameId(null);
      setSelectedProducts(new Set());
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

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  // 상품 필터링
  const filteredProducts = productsData?.content?.filter((product) => {
    if (!productSearchQuery) return true;
    const query = productSearchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 게임 생성</DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? 'Step 1: 게임 기본 정보를 입력해주세요.'
              : 'Step 2: 게임에 연결할 상품을 선택해주세요.'}
          </DialogDescription>
        </DialogHeader>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 1
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-muted-foreground'
              }`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={currentStep >= 1 ? 'font-medium' : 'text-muted-foreground'}>
              게임 정보
            </span>
          </div>
          <div className="w-16 h-0.5 bg-muted" />
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 2
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-muted-foreground'
              }`}
            >
              2
            </div>
            <span className={currentStep >= 2 ? 'font-medium' : 'text-muted-foreground'}>
              상품 연결
            </span>
          </div>
        </div>

        {currentStep === 1 ? (
          <form onSubmit={form.handleSubmit(onStep1Submit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  게임 제목 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="게임 제목을 입력하세요"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  게임 타입 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(value) => form.setValue('type', value as GameType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="게임 타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">DAILY</SelectItem>
                    <SelectItem value="SELECT">SELECT</SelectItem>
                    <SelectItem value="VIBE">VIBE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                {...form.register('description')}
                placeholder="게임 설명을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Input
                  id="category"
                  {...form.register('category')}
                  placeholder="카테고리"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainProductName">메인 상품명</Label>
                <Input
                  id="mainProductName"
                  {...form.register('mainProductName')}
                  placeholder="메인 상품명"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryFee">
                  참가비 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="entryFee"
                  type="number"
                  {...form.register('entryFee', { valueAsNumber: true })}
                  placeholder="0"
                />
                {form.formState.errors.entryFee && (
                  <p className="text-sm text-red-500">{form.formState.errors.entryFee.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">
                  통화 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.watch('currency')}
                  onValueChange={(value) => form.setValue('currency', value as Currency)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="통화 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">CASH</SelectItem>
                    <SelectItem value="POINT">POINT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardPoint">보상 포인트</Label>
                <Input
                  id="rewardPoint"
                  type="number"
                  {...form.register('rewardPoint', { valueAsNumber: true })}
                  placeholder="보상 포인트"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minEntries">
                  최소 참가 인원 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="minEntries"
                  type="number"
                  {...form.register('minEntries', { valueAsNumber: true })}
                  placeholder="1"
                />
                {form.formState.errors.minEntries && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.minEntries.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxEntries">최대 참가 인원</Label>
                <Input
                  id="maxEntries"
                  type="number"
                  {...form.register('maxEntries', { valueAsNumber: true })}
                  placeholder="최대 참가 인원"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxEntriesPerUser">
                  사용자당 최대 참가 횟수 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxEntriesPerUser"
                  type="number"
                  {...form.register('maxEntriesPerUser', { valueAsNumber: true })}
                  placeholder="1"
                />
                {form.formState.errors.maxEntriesPerUser && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.maxEntriesPerUser.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gridRows">그리드 행 수</Label>
                <Input
                  id="gridRows"
                  type="number"
                  {...form.register('gridRows', { valueAsNumber: true })}
                  placeholder="그리드 행 수"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gridCols">그리드 열 수</Label>
                <Input
                  id="gridCols"
                  type="number"
                  {...form.register('gridCols', { valueAsNumber: true })}
                  placeholder="그리드 열 수"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visibleFrom">공개 시작 시간</Label>
                <Input
                  id="visibleFrom"
                  type="datetime-local"
                  {...form.register('visibleFrom')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">게임 시작 시간</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  {...form.register('startTime')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">게임 종료 시간</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...form.register('endTime')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customRules">커스텀 규칙</Label>
              <Input
                id="customRules"
                {...form.register('customRules')}
                placeholder="커스텀 규칙을 입력하세요"
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowDuplicate">중복 허용</Label>
                  <p className="text-sm text-muted-foreground">
                    동일한 선택을 여러 번 허용할지 설정합니다
                  </p>
                </div>
                <Switch
                  id="allowDuplicate"
                  checked={form.watch('allowDuplicate')}
                  onCheckedChange={(checked) => form.setValue('allowDuplicate', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotification">알림 활성화</Label>
                  <p className="text-sm text-muted-foreground">
                    게임 관련 알림을 활성화합니다
                  </p>
                </div>
                <Switch
                  id="enableNotification"
                  checked={form.watch('enableNotification')}
                  onCheckedChange={(checked) => form.setValue('enableNotification', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isRecommended">추천 게임</Label>
                  <p className="text-sm text-muted-foreground">
                    추천 게임으로 표시할지 설정합니다
                  </p>
                </div>
                <Switch
                  id="isRecommended"
                  checked={form.watch('isRecommended')}
                  onCheckedChange={(checked) => form.setValue('isRecommended', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoEndOnMax">최대 인원 도달 시 자동 종료</Label>
                  <p className="text-sm text-muted-foreground">
                    최대 참가 인원에 도달하면 자동으로 종료합니다
                  </p>
                </div>
                <Switch
                  id="autoEndOnMax"
                  checked={form.watch('autoEndOnMax')}
                  onCheckedChange={(checked) => form.setValue('autoEndOnMax', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoEndOnTime">시간 종료 시 자동 종료</Label>
                  <p className="text-sm text-muted-foreground">
                    종료 시간에 도달하면 자동으로 종료합니다
                  </p>
                </div>
                <Switch
                  id="autoEndOnTime"
                  checked={form.watch('autoEndOnTime')}
                  onCheckedChange={(checked) => form.setValue('autoEndOnTime', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="deployContract">블록체인 컨트랙트 배포</Label>
                  <p className="text-sm text-muted-foreground">
                    게임 생성 시 블록체인 컨트랙트를 배포합니다
                  </p>
                </div>
                <Switch
                  id="deployContract"
                  checked={form.watch('deployContract')}
                  onCheckedChange={(checked) => form.setValue('deployContract', checked)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    다음 단계
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            {/* 상품 검색 */}
            <div className="space-y-2">
              <Label htmlFor="productSearch">상품 검색</Label>
              <Input
                id="productSearch"
                placeholder="상품명, SKU, 브랜드로 검색..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
              />
            </div>

            {/* 상품 목록 */}
            <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedProducts.has(product.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <div
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 ${
                          selectedProducts.has(product.id)
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedProducts.has(product.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      {product.thumbnail && (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.brand && <span>브랜드: {product.brand}</span>}
                          {product.sku && (
                            <span className={product.brand ? ' • ' : ''}>SKU: {product.sku}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {productSearchQuery ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              선택된 상품: {selectedProducts.size}개
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedProducts(new Set());
                }}
                disabled={isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                이전 단계
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                나중에 연결
              </Button>
              <Button type="button" onClick={onStep2Submit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    연결 중...
                  </>
                ) : (
                  '상품 연결 완료'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
