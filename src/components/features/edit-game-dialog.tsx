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
import { useUpdateGame, useGame } from '@/lib/hooks/use-games';
import { useToast } from '@/hooks/use-toast';
import type { GameType, Currency, GameStatusType } from '@/lib/types/game';
import { Loader2 } from 'lucide-react';

const gameFormSchema = z.object({
  title: z.string().min(1, '게임 제목을 입력해주세요'),
  description: z.string().optional(),
  mainProductName: z.string().optional(),
  type: z.enum(['DAILY', 'SELECT', 'VIBE']),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'READY', 'SCHEDULED', 'ACTIVE', 'IN_PROGRESS', 'PAUSED', 'SETTLING', 'ENDED', 'COMPLETED', 'FAILED']).optional(),
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
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface EditGameDialogProps {
  gameId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGameDialog({ gameId, open, onOpenChange }: EditGameDialogProps) {
  const { toast } = useToast();
  const updateGame = useUpdateGame();
  const { data: gameData } = useGame(gameId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  // 게임 데이터가 로드되면 폼 초기화
  useEffect(() => {
    if (gameData && open) {
      const game = gameData;
      // datetime-local 형식으로 변환
      const formatDateTimeLocal = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      form.reset({
        title: game.title || '',
        description: game.description || '',
        mainProductName: game.mainProductName || '',
        type: game.type || 'DAILY',
        category: game.category || '',
        status: game.status as GameStatusType,
        entryFee: game.entryFee || 0,
        currency: game.currency || 'POINT',
        minEntries: game.minEntries || 1,
        maxEntries: game.maxEntries,
        maxEntriesPerUser: game.maxEntriesPerUser || 1,
        rewardPoint: game.rewardPoint,
        gridRows: game.gridRows,
        gridCols: game.gridCols,
        visibleFrom: formatDateTimeLocal(game.visibleFrom),
        startTime: formatDateTimeLocal(game.startTime),
        endTime: formatDateTimeLocal(game.endTime),
        allowDuplicate: game.allowDuplicate || false,
        enableNotification: game.enableNotification ?? true,
        isRecommended: game.isRecommended || false,
        customRules: game.customRules || '',
        autoEndOnMax: game.autoEndOnMax || false,
        autoEndOnTime: game.autoEndOnTime || false,
      });
    }
  }, [gameData, form, open]);

  const onSubmit = async (data: GameFormValues) => {
    if (!gameId) return;

    setIsSubmitting(true);
    try {
      const { status, ...updateData } = data;

      // 빈 문자열을 undefined로 변환
      const cleanedData = {
        ...updateData,
        description: updateData.description || undefined,
        mainProductName: updateData.mainProductName || undefined,
        category: updateData.category || undefined,
        maxEntries: updateData.maxEntries || undefined,
        rewardPoint: updateData.rewardPoint || undefined,
        gridRows: updateData.gridRows || undefined,
        gridCols: updateData.gridCols || undefined,
        visibleFrom: updateData.visibleFrom || undefined,
        startTime: updateData.startTime || undefined,
        endTime: updateData.endTime || undefined,
        customRules: updateData.customRules || undefined,
      };

      const result = await updateGame.mutateAsync({
        id: gameId,
        data: {
          ...cleanedData,
          status: status as GameStatusType | undefined,
        },
      });

      toast({
        title: '게임 수정 성공',
        description: '게임 정보가 성공적으로 수정되었습니다.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: '게임 수정 실패',
        description: error instanceof Error ? error.message : '게임 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!gameId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>게임 수정</DialogTitle>
          <DialogDescription>게임 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="status">상태</Label>
            <Select
              value={form.watch('status') || ''}
              onValueChange={(value) => form.setValue('status', value as GameStatusType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
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
                  수정 중...
                </>
              ) : (
                '수정 완료'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

