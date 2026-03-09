'use client';

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAllContracts, useTransaction, useEntryStatus, useVerifyContract } from '@/lib/hooks/use-blockchain';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Eye,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ContractInfo {
  gameId: string;
  gameTitle: string;
  contractAddress?: string;
  deploymentTxHash?: string;
  network?: string;
  status?: string;
  createdAt?: string;
}

interface TransactionInfo {
  txHash: string;
  status: string;
  blockNumber?: number;
  gasUsed?: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DEPLOYED: 'bg-green-500',
  DEPLOYING: 'bg-blue-500',
  FAILED: 'bg-red-500',
  PENDING: 'bg-yellow-500',
  NOT_DEPLOYED: 'bg-gray-500',
};

const txStatusColors: Record<string, string> = {
  SUCCESS: 'bg-green-500',
  PENDING: 'bg-yellow-500',
  FAILED: 'bg-red-500',
  CONFIRMED: 'bg-blue-500',
};

export default function BlockchainPage() {
  const [txSearchHash, setTxSearchHash] = useState('');
  const [entrySearchId, setEntrySearchId] = useState('');
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: contractsData, isLoading: contractsLoading } = useAllContracts();
  const { data: txData, isLoading: txLoading } = useTransaction(selectedTxHash || '');
  const { data: entryData, isLoading: entryLoading } = useEntryStatus(selectedEntryId || '');
  const verifyContract = useVerifyContract();

  const handleVerifyContract = async (gameId: string) => {
    try {
      await verifyContract.mutateAsync(gameId);
      toast({
        title: '컨트랙트 검증 성공',
        description: '컨트랙트가 성공적으로 검증되었습니다.',
      });
    } catch (error) {
      toast({
        title: '컨트랙트 검증 실패',
        description: error instanceof Error ? error.message : '컨트랙트 검증 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const contracts = contractsData || [];

  // Calculate statistics
  const stats = {
    total: contracts.length,
    deployed: contracts.filter((c) => c.status === 'DEPLOYED').length,
    pending: contracts.filter((c) => c.status === 'DEPLOYING' || c.status === 'PENDING').length,
    failed: contracts.filter((c) => c.status === 'FAILED').length,
  };

  const handleSearchTransaction = () => {
    if (!txSearchHash.trim()) {
      toast({
        title: '오류',
        description: '트랜잭션 해시를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedTxHash(txSearchHash.trim());
    setTxDialogOpen(true);
  };

  const handleSearchEntry = () => {
    if (!entrySearchId.trim()) {
      toast({
        title: '오류',
        description: '엔트리 ID를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedEntryId(entrySearchId.trim());
    setEntryDialogOpen(true);
  };

  const contractColumns: ColumnDef<ContractInfo>[] = [
    {
      accessorKey: 'gameTitle',
      header: '게임',
      cell: ({ row }) => {
        const gameTitle = row.getValue('gameTitle') as string;
        return <div className="font-medium">{gameTitle}</div>;
      },
    },
    {
      accessorKey: 'contractAddress',
      header: '컨트랙트 주소',
      cell: ({ row }) => {
        const address = row.getValue('contractAddress') as string | undefined;
        if (!address) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex items-center space-x-2">
            <code className="text-xs font-mono">{address.slice(0, 10)}...</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(address);
                toast({
                  title: '복사됨',
                  description: '컨트랙트 주소가 클립보드에 복사되었습니다.',
                });
              }}
            >
              복사
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'network',
      header: '네트워크',
      cell: ({ row }) => {
        const network = row.getValue('network') as string | undefined;
        return network || <span className="text-muted-foreground">-</span>;
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = (row.getValue('status') as string) || 'NOT_DEPLOYED';
        return (
          <Badge className={statusColors[status] || 'bg-gray-500'}>
            {status === 'DEPLOYED' && '배포됨'}
            {status === 'DEPLOYING' && '배포 중'}
            {status === 'FAILED' && '실패'}
            {status === 'PENDING' && '대기 중'}
            {status === 'NOT_DEPLOYED' && '미배포'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '배포일',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string | undefined;
        if (!createdAt) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="text-sm">
            {format(new Date(createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const contract = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {contract.deploymentTxHash && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedTxHash(contract.deploymentTxHash!);
                    setTxDialogOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  트랜잭션 보기
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  if (contract.contractAddress) {
                    navigator.clipboard.writeText(contract.contractAddress);
                    toast({
                      title: '복사됨',
                      description: '컨트랙트 주소가 클립보드에 복사되었습니다.',
                    });
                  }
                }}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                주소 복사
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleVerifyContract(contract.gameId)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                컨트랙트 검증
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="블록체인 관리"
          description="블록체인 컨트랙트 및 트랜잭션 관리"
        />

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="총 컨트랙트"
            value={stats.total}
            icon={LinkIcon}
            description="배포된 컨트랙트 수"
          />
          <StatsCard
            title="배포 성공"
            value={stats.deployed}
            icon={CheckCircle2}
            description="정상 배포된 컨트랙트"
          />
          <StatsCard
            title="배포 대기"
            value={stats.pending}
            icon={Clock}
            description="배포 중인 컨트랙트"
          />
          <StatsCard
            title="배포 실패"
            value={stats.failed}
            icon={XCircle}
            description="배포 실패한 컨트랙트"
          />
        </div>

        {/* Search Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tx-search">트랜잭션 해시 검색</Label>
            <div className="flex space-x-2">
              <Input
                id="tx-search"
                placeholder="0x..."
                value={txSearchHash}
                onChange={(e) => setTxSearchHash(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchTransaction();
                  }
                }}
              />
              <Button onClick={handleSearchTransaction} disabled={!txSearchHash.trim()}>
                검색
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="entry-search">엔트리 ID 검색</Label>
            <div className="flex space-x-2">
              <Input
                id="entry-search"
                placeholder="Entry ID"
                value={entrySearchId}
                onChange={(e) => setEntrySearchId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchEntry();
                  }
                }}
              />
              <Button onClick={handleSearchEntry} disabled={!entrySearchId.trim()}>
                검색
              </Button>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">컨트랙트 목록</h2>
          {contractsLoading ? (
            <LoadingSpinner />
          ) : contracts.length === 0 ? (
            <EmptyState
              icon={LinkIcon}
              title="컨트랙트가 없습니다"
              description="배포된 컨트랙트가 없습니다."
            />
          ) : (
            <DataTable
              columns={contractColumns}
              data={contracts}
              searchKey="gameTitle"
              searchPlaceholder="게임명으로 검색..."
            />
          )}
        </div>

        {/* Transaction Detail Dialog */}
        <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>트랜잭션 상세 정보</DialogTitle>
              <DialogDescription>트랜잭션 해시: {selectedTxHash}</DialogDescription>
            </DialogHeader>
            {txLoading ? (
              <LoadingSpinner />
            ) : txData ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label>트랜잭션 해시</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <code className="text-xs font-mono">{txData.txHash}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(txData.txHash);
                          toast({
                            title: '복사됨',
                            description: '트랜잭션 해시가 클립보드에 복사되었습니다.',
                          });
                        }}
                      >
                        복사
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>상태</Label>
                    <div className="mt-1">
                      <Badge
                        className={
                          txStatusColors[txData.status] || 'bg-gray-500'
                        }
                      >
                        {txData.status}
                      </Badge>
                    </div>
                  </div>
                  {txData.blockNumber && (
                    <div>
                      <Label>블록 번호</Label>
                      <div className="mt-1 text-sm">{txData.blockNumber}</div>
                    </div>
                  )}
                  {txData.gasUsed && (
                    <div>
                      <Label>가스 사용량</Label>
                      <div className="mt-1 text-sm">{txData.gasUsed.toLocaleString()}</div>
                    </div>
                  )}
                  <div>
                    <Label>생성일</Label>
                    <div className="mt-1 text-sm">
                      {format(new Date(txData.createdAt), 'yyyy-MM-dd HH:mm:ss', {
                        locale: ko,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                트랜잭션을 찾을 수 없습니다.
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Entry Status Dialog */}
        <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>엔트리 상태</DialogTitle>
              <DialogDescription>엔트리 ID: {selectedEntryId}</DialogDescription>
            </DialogHeader>
            {entryLoading ? (
              <LoadingSpinner />
            ) : entryData ? (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label>엔트리 ID</Label>
                    <div className="mt-1 text-sm font-mono">{entryData.entryId}</div>
                  </div>
                  <div>
                    <Label>상태</Label>
                    <div className="mt-1">
                      <Badge>{entryData.status}</Badge>
                    </div>
                  </div>
                  {entryData.txIntents && entryData.txIntents.length > 0 && (
                    <div>
                      <Label>트랜잭션 인텐트</Label>
                      <div className="mt-2 space-y-2">
                        {entryData.txIntents.map((intent, index) => (
                          <div
                            key={intent.intentId}
                            className="rounded-lg border p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">인텐트 #{index + 1}</span>
                              <Badge
                                className={
                                  intent.status === 'SUCCESS'
                                    ? 'bg-green-500'
                                    : intent.status === 'FAILED'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }
                              >
                                {intent.status}
                              </Badge>
                            </div>
                            {intent.txHash && (
                              <div className="text-xs text-muted-foreground">
                                TX: {intent.txHash.slice(0, 20)}...
                              </div>
                            )}
                            {intent.errorMessage && (
                              <div className="text-xs text-red-500">{intent.errorMessage}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              생성: {format(new Date(intent.createdAt), 'yyyy-MM-dd HH:mm', {
                                locale: ko,
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
              엔트리를 찾을 수 없습니다.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

