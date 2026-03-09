'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { gameProductService } from '@/lib/api';
import { useContractInfo } from '@/lib/hooks/use-blockchain';
import { useCreateGame } from '@/lib/hooks/use-games';
import { useProducts } from '@/lib/hooks/use-products';
import type { Currency, GameType } from '@/lib/types/game';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const gameFormSchema = z.object({
  title: z.string().min(1, '게임 제목을 입력해주세요'),
  description: z.string().optional(),
  mainProductName: z.string().optional(),
  type: z.enum(['DAILY', 'SELECT', 'VIBE', 'PRIME']),
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
  const [deploymentTxHash, setDeploymentTxHash] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<'PENDING' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | null>(null);
  const [deployContractEnabled, setDeployContractEnabled] = useState(false);

  // 컨트랙트 정보 조회 (게임 생성 후 주기적으로 확인)
  const { data: contractInfo, refetch: refetchContractInfo } = useContractInfo(
    createdGameId || ''
  );

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
      setDeploymentTxHash(null);
      setContractAddress(null);
      setDeploymentStatus(null);
      setDeployContractEnabled(false);
      form.reset();
    }
  }, [open, form]);

  // 컨트랙트 배포 상태 확인 (주기적으로)
  // PENDING 또는 DEPLOYING 상태일 때만 폴링 (명시적으로 처리하여 무한 폴링 방지)
  useEffect(() => {
    if (
      createdGameId &&
      deployContractEnabled &&
      (deploymentStatus === 'PENDING' || deploymentStatus === 'DEPLOYING')
    ) {
      const interval = setInterval(() => {
        refetchContractInfo();
      }, 5000); // 5초마다 확인

      return () => clearInterval(interval);
    }
  }, [createdGameId, deployContractEnabled, deploymentStatus, refetchContractInfo]);

  // 컨트랙트 정보 업데이트
  useEffect(() => {
    if (contractInfo) {
      if (contractInfo.deploymentTxHash) {
        setDeploymentTxHash(contractInfo.deploymentTxHash);
      }
      if (contractInfo.contractAddress) {
        setContractAddress(contractInfo.contractAddress);
      }
      // status가 있는 경우에만 처리 (명시적으로 체크하여 무한 폴링 방지)
      if (contractInfo.status && typeof contractInfo.status === 'string') {
        const status = contractInfo.status.trim().toUpperCase();

        // 알려진 상태 값 처리
        if (status === 'DEPLOYED') {
          setDeploymentStatus('DEPLOYED');
        } else if (status === 'DEPLOYING') {
          setDeploymentStatus('DEPLOYING');
        } else if (status === 'PENDING') {
          setDeploymentStatus('PENDING');
        } else if (status === 'FAILED') {
          setDeploymentStatus('FAILED');
        } else {
          // 알 수 없는 상태 값이 오면 폴링을 중지하기 위해 'FAILED'로 설정
          // 이렇게 하면 폴링 조건에서 제외되어 무한 폴링이 방지됨
          console.warn(`Unknown deployment status: ${status}. Treating as FAILED to stop polling.`);
          setDeploymentStatus('FAILED');
        }
      }
      // status가 없거나 빈 문자열인 경우는 처리하지 않음 (이전 상태 유지)
      // 이는 아직 배포 정보가 없거나 로딩 중일 수 있기 때문
    }
  }, [contractInfo]);

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

        // 컨트랙트 배포 관련 정보 설정
        if (deployContract) {
          setDeployContractEnabled(true);
          setDeploymentStatus(result.deploymentStatus || (result.contractDeploymentRequested ? 'PENDING' : null));
          if (result.deploymentTxHash) {
            setDeploymentTxHash(result.deploymentTxHash);
          }
          if (result.contractAddress) {
            setContractAddress(result.contractAddress);
          }
          // GameDto에서도 확인
          if (result.game.onchainTxHash) {
            setDeploymentTxHash(result.game.onchainTxHash);
          }
          if (result.game.onchainContractAddr) {
            setContractAddress(result.game.onchainContractAddr);
          }
        }

        setCurrentStep(2);
        toast({
          title: '게임 생성 완료',
          description: deployContract
            ? '게임이 생성되었습니다. 컨트랙트 배포가 진행 중입니다. 이제 상품을 연결해주세요.'
            : '이제 상품을 연결해주세요.',
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
                  <SelectItem value="PRIME">프라임</SelectItem>
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
            <DateTimePicker
              id="visibleFrom"
              label="공개 시작 시간"
              value={form.watch('visibleFrom')}
              onChange={(value) => form.setValue('visibleFrom', value)}
            />

            <DateTimePicker
              id="startTime"
              label="게임 시작 시간"
              value={form.watch('startTime')}
              onChange={(value) => form.setValue('startTime', value)}
            />
          </div>

          <DateTimePicker
            id="endTime"
            label="게임 종료 시간"
            value={form.watch('endTime')}
            onChange={(value) => form.setValue('endTime', value)}
          />

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
            {/* 컨트랙트 배포 상태 표시 */}
            {deployContractEnabled && deploymentStatus && (
              <Alert
                className={
                  deploymentStatus === 'DEPLOYED'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : deploymentStatus === 'FAILED'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                }
              >
                <AlertCircle
                  className={`h-4 w-4 ${
                    deploymentStatus === 'DEPLOYED'
                      ? 'text-green-600 dark:text-green-400'
                      : deploymentStatus === 'FAILED'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }`}
                />
                <AlertTitle className="flex items-center gap-2">
                  컨트랙트 배포 상태
                  <Badge
                    variant={
                      deploymentStatus === 'DEPLOYED'
                        ? 'default'
                        : deploymentStatus === 'FAILED'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="ml-2"
                  >
                    {deploymentStatus === 'DEPLOYED'
                      ? '배포 완료'
                      : deploymentStatus === 'FAILED'
                      ? '배포 실패'
                      : deploymentStatus === 'DEPLOYING'
                      ? '배포 중'
                      : '대기 중'}
                    {deploymentStatus === 'DEPLOYING' || deploymentStatus === 'PENDING' ? (
                      <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                    ) : null}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="space-y-2 mt-2">
                  {deploymentStatus === 'DEPLOYED' ? (
                    <p className="text-sm text-green-700 dark:text-green-300">
                      컨트랙트가 성공적으로 배포되었습니다. 게임 생성이 완료되었으므로 상품을 연결할 수 있습니다.
                    </p>
                  ) : deploymentStatus === 'FAILED' ? (
                    <p className="text-sm text-red-700 dark:text-red-300">
                      컨트랙트 배포에 실패했습니다. 게임은 생성되었지만 블록체인에 배포되지 않았습니다. 상품 연결은 가능합니다.
                    </p>
                  ) : (
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      컨트랙트 배포가 진행 중입니다. 가스비가 소모되고 있습니다. 게임 생성은 완료되었으므로 상품을 연결할 수 있습니다.
                    </p>
                  )}
                  {deploymentTxHash && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">트랜잭션 해시:</span>
                      <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                        {deploymentTxHash.slice(0, 10)}...{deploymentTxHash.slice(-8)}
                      </code>
                      <a
                        href={`https://etherscan.io/tx/${deploymentTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Etherscan에서 확인
                      </a>
                    </div>
                  )}
                  {contractAddress && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">컨트랙트 주소:</span>
                      <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                        {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                      </code>
                      <a
                        href={`https://etherscan.io/address/${contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Etherscan에서 확인
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

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
