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
import { useGame } from '@/lib/hooks/use-games';
import { gameProductService, blockchainService } from '@/lib/api';
import { GameStatus, GameType, Currency } from '@/lib/types/game';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Calendar, Coins, Users, Trophy, Link } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface GameDetailDialogProps {
  gameId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500',
  READY: 'bg-blue-500',
  SCHEDULED: 'bg-purple-500',
  ACTIVE: 'bg-green-500',
  IN_PROGRESS: 'bg-blue-500',
  PAUSED: 'bg-yellow-500',
  SETTLING: 'bg-orange-500',
  ENDED: 'bg-gray-500',
  COMPLETED: 'bg-green-500',
  FAILED: 'bg-red-500',
};

export function GameDetailDialog({
  gameId,
  open,
  onOpenChange,
  onEdit,
}: GameDetailDialogProps) {
  const { data, isLoading, error } = useGame(gameId || '');
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  const game = data;

  // 게임 상품 목록 조회
  const { data: gameProductsData } = useQuery({
    queryKey: ['game-products', gameId],
    queryFn: () => gameProductService.getGameProducts(gameId || ''),
    enabled: !!gameId && open,
  });

  // 블록체인 컨트랙트 정보 조회
  useEffect(() => {
    if (game?.id && game?.onchainContractAddr && open) {
      setLoadingContract(true);
      blockchainService
        .getContractInfo(game.id)
        .then((info) => {
          setContractInfo(info);
        })
        .catch(() => {
          setContractInfo(null);
        })
        .finally(() => {
          setLoadingContract(false);
        });
    } else {
      setContractInfo(null);
    }
  }, [game?.id, game?.onchainContractAddr, open]);

  if (!gameId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>게임 상세 정보</DialogTitle>
          <DialogDescription>게임의 상세 정보를 확인합니다.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !game ? (
          <div className="text-center py-8 text-muted-foreground">
            게임 정보를 불러올 수 없습니다.
          </div>
        ) : (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{game.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{game.type}</Badge>
                    {game.category && <Badge variant="outline">{game.category}</Badge>}
                    {game.status && (
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            statusColors[game.status] || 'bg-gray-400'
                          }`}
                        />
                        <span className="text-sm text-muted-foreground capitalize">
                          {game.status.toLowerCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {onEdit && (
                  <Button variant="outline" onClick={onEdit}>
                    수정
                  </Button>
                )}
              </div>
              {game.description && (
                <p className="text-sm text-muted-foreground">{game.description}</p>
              )}
            </div>

            <Separator />

            {/* 참가비 및 보상 정보 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm">참가비</span>
                </div>
                <div className="text-xl font-bold">
                  {game.entryFee?.toLocaleString() || 0} {game.currency || 'POINT'}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">보상 포인트</span>
                </div>
                <div className="text-xl font-bold">
                  {game.rewardPoint?.toLocaleString() || 0} pts
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">참가 인원</span>
                </div>
                <div className="text-xl font-bold">
                  {game.minEntries || 0}
                  {game.maxEntries && ` - ${game.maxEntries}`}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">사용자당 최대</span>
                </div>
                <div className="text-xl font-bold">{game.maxEntriesPerUser || 1}회</div>
              </div>
            </div>

            <Separator />

            {/* 시간 정보 */}
            <div className="space-y-4">
              <h4 className="font-semibold">시간 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {game.visibleFrom && (
                  <div>
                    <div className="text-muted-foreground mb-1">공개 시작</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(game.visibleFrom).toLocaleString('ko-KR')}
                    </div>
                  </div>
                )}
                {game.startTime && (
                  <div>
                    <div className="text-muted-foreground mb-1">게임 시작</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(game.startTime).toLocaleString('ko-KR')}
                    </div>
                  </div>
                )}
                {game.endTime && (
                  <div>
                    <div className="text-muted-foreground mb-1">게임 종료</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(game.endTime).toLocaleString('ko-KR')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 그리드 설정 */}
            {(game.gridRows || game.gridCols) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">그리드 설정</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {game.gridRows && (
                      <div>
                        <div className="text-muted-foreground mb-1">행 수</div>
                        <div className="font-medium">{game.gridRows}</div>
                      </div>
                    )}
                    {game.gridCols && (
                      <div>
                        <div className="text-muted-foreground mb-1">열 수</div>
                        <div className="font-medium">{game.gridCols}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 옵션 */}
            <Separator />
            <div className="space-y-4">
              <h4 className="font-semibold">게임 옵션</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>중복 허용</span>
                  <Badge variant={game.allowDuplicate ? 'default' : 'secondary'}>
                    {game.allowDuplicate ? '예' : '아니오'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>알림 활성화</span>
                  <Badge variant={game.enableNotification ? 'default' : 'secondary'}>
                    {game.enableNotification ? '예' : '아니오'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>추천 게임</span>
                  <Badge variant={game.isRecommended ? 'default' : 'secondary'}>
                    {game.isRecommended ? '예' : '아니오'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>최대 인원 도달 시 자동 종료</span>
                  <Badge variant={game.autoEndOnMax ? 'default' : 'secondary'}>
                    {game.autoEndOnMax ? '예' : '아니오'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>시간 종료 시 자동 종료</span>
                  <Badge variant={game.autoEndOnTime ? 'default' : 'secondary'}>
                    {game.autoEndOnTime ? '예' : '아니오'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 연결된 상품 목록 */}
            {gameProductsData && gameProductsData.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">연결된 상품 ({gameProductsData.length}개)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {gameProductsData.slice(0, 6).map((product) => (
                      <div
                        key={product.id}
                        className="p-3 border rounded-lg flex items-center gap-3"
                      >
                        {product.product?.thumbnail && (
                          <img
                            src={product.product.thumbnail}
                            alt={product.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {product.product?.name || '상품명 없음'}
                          </div>
                          {product.isGrandPrize && (
                            <Badge variant="default" className="mt-1">
                              그랜드 프라이즈
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {gameProductsData.length > 6 && (
                    <p className="text-sm text-muted-foreground">
                      외 {gameProductsData.length - 6}개의 상품이 더 있습니다.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* 블록체인 정보 */}
            {(game.onchainContractAddr || contractInfo) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    블록체인 정보
                  </h4>
                  {loadingContract ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {game.onchainContractAddr && (
                        <div>
                          <div className="text-muted-foreground mb-1">컨트랙트 주소</div>
                          <div className="font-mono text-xs break-all">
                            {game.onchainContractAddr}
                          </div>
                        </div>
                      )}
                      {game.onchainTxHash && (
                        <div>
                          <div className="text-muted-foreground mb-1">트랜잭션 해시</div>
                          <div className="font-mono text-xs break-all">{game.onchainTxHash}</div>
                        </div>
                      )}
                      {contractInfo && (
                        <>
                          {contractInfo.network && (
                            <div>
                              <div className="text-muted-foreground mb-1">네트워크</div>
                              <div>{contractInfo.network}</div>
                            </div>
                          )}
                          {contractInfo.status && (
                            <div>
                              <div className="text-muted-foreground mb-1">배포 상태</div>
                              <Badge variant="outline">{contractInfo.status}</Badge>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 생성/수정일 */}
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">생성일</div>
                <div>{formatDistanceToNow(new Date(game.createdAt), { addSuffix: true })}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">수정일</div>
                <div>{formatDistanceToNow(new Date(game.updatedAt), { addSuffix: true })}</div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => onOpenChange(false)}>닫기</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

