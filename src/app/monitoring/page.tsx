'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useSystemHealth,
  useTransactionStatus,
  useEventStatus,
  useLogs,
  useMetrics,
  useRetryEvent,
} from '@/lib/hooks/use-monitoring';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Server,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ColumnDef } from '@tanstack/react-table';
import { ChartCard } from '@/components/shared/chart-card';

const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
const services = ['api', 'auth', 'game', 'product', 'blockchain', 'storage'];

export default function MonitoringPage() {
  const [logLevel, setLogLevel] = useState<string>('');
  const [logService, setLogService] = useState<string>('');
  const [logPage, setLogPage] = useState(0);
  const [metricsPeriod, setMetricsPeriod] = useState<'day' | 'week' | 'month'>('day');
  const { toast } = useToast();

  const { data: healthData, isLoading: healthLoading, error: healthError } = useSystemHealth();
  const { data: txStatusData, isLoading: txLoading, error: txError } = useTransactionStatus();
  const { data: eventStatusData, isLoading: eventLoading, error: eventError } = useEventStatus();
  const { data: logsData, isLoading: logsLoading, error: logsError } = useLogs({
    level: logLevel || undefined,
    service: logService || undefined,
    page: logPage,
    size: 20,
  });
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useMetrics({
    interval: metricsPeriod,
  });
  const retryEvent = useRetryEvent();

  const handleRetryEvent = async (eventId: string) => {
    try {
      await retryEvent.mutateAsync(eventId);
      toast({
        title: '성공',
        description: '이벤트 재시도가 요청되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '이벤트 재시도에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // Log columns
  const logColumns: ColumnDef<{
    id: string;
    level: string;
    service: string;
    message: string;
    timestamp: string;
  }>[] = [
    {
      accessorKey: 'timestamp',
      header: '시간',
      cell: ({ row }) => {
        const timestamp = row.getValue('timestamp') as string;
        return (
          <div className="text-sm">
            {format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
          </div>
        );
      },
    },
    {
      accessorKey: 'level',
      header: '레벨',
      cell: ({ row }) => {
        const level = row.getValue('level') as string;
        const colors: Record<string, string> = {
          INFO: 'bg-blue-500',
          WARN: 'bg-yellow-500',
          ERROR: 'bg-red-500',
          DEBUG: 'bg-gray-500',
        };
        return (
          <Badge className={colors[level] || 'bg-gray-500'}>
            {level}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'service',
      header: '서비스',
      cell: ({ row }) => {
        const service = row.getValue('service') as string;
        return <Badge variant="outline">{service}</Badge>;
      },
    },
    {
      accessorKey: 'message',
      header: '메시지',
      cell: ({ row }) => {
        const message = row.getValue('message') as string;
        return <div className="max-w-md truncate text-sm">{message}</div>;
      },
    },
  ];

  // Transform metrics data for charts
  const cpuChartData = metricsError ? undefined : metricsData?.cpu
    ? {
        labels: metricsData.cpu.map((d) => format(new Date(d.timestamp), 'HH:mm', { locale: ko })),
        datasets: [{ label: 'CPU 사용률 (%)', data: metricsData.cpu.map((d) => d.value) }],
      }
    : undefined;

  const memoryChartData = metricsError ? undefined : metricsData?.memory
    ? {
        labels: metricsData.memory.map((d) => format(new Date(d.timestamp), 'HH:mm', { locale: ko })),
        datasets: [{ label: '메모리 사용률 (%)', data: metricsData.memory.map((d) => d.value) }],
      }
    : undefined;

  const requestsChartData = metricsError ? undefined : metricsData?.requests
    ? {
        labels: metricsData.requests.map((d) => format(new Date(d.timestamp), 'HH:mm', { locale: ko })),
        datasets: [{ label: '요청 수', data: metricsData.requests.map((d) => d.count) }],
      }
    : undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="System Monitoring"
          description="시스템 모니터링 및 로그 관리"
        />

        {/* Health Status Cards */}
        {healthData && !healthError ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="시스템 상태"
              value={healthData.status}
              icon={healthData.status === 'UP' ? CheckCircle2 : AlertCircle}
              description={healthData.timestamp}
            />
            <StatsCard
              title="미발행 이벤트"
              value={healthData.metrics?.unpublishedEvents || 0}
              icon={Activity}
              description="대기 중인 이벤트"
            />
            <StatsCard
              title="대기 중 트랜잭션"
              value={healthData.metrics?.pendingTransactions || 0}
              icon={Clock}
              description="처리 대기 중"
            />
            <StatsCard
              title="실패한 트랜잭션"
              value={healthData.metrics?.failedTransactions || 0}
              icon={XCircle}
              description="처리 실패"
            />
          </div>
        ) : healthError ? (
          <div className="rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-950">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              시스템 상태를 불러올 수 없습니다. 서버 오류가 발생했습니다.
            </p>
          </div>
        ) : null}

        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label>레벨</Label>
                <Select value={logLevel || 'all'} onValueChange={(value) => {
                  setLogLevel(value === 'all' ? '' : value);
                  setLogPage(0);
                }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {logLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label>서비스</Label>
                <Select value={logService || 'all'} onValueChange={(value) => {
                  setLogService(value === 'all' ? '' : value);
                  setLogPage(0);
                }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {logsLoading ? (
              <LoadingSpinner />
            ) : logsError ? (
              <EmptyState icon={AlertCircle} title="로그를 불러올 수 없습니다" description="서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." />
            ) : !logsData || logsData.content.length === 0 ? (
              <EmptyState icon={Activity} title="로그가 없습니다" description="선택한 조건에 맞는 로그가 없습니다." />
            ) : (
              <DataTable
                columns={logColumns}
                data={logsData.content}
                searchKey="message"
                searchPlaceholder="로그 메시지로 검색..."
                enableServerSidePagination={true}
                pageCount={logsData.totalPages}
                onPaginationChange={(newPage) => {
                  setLogPage(newPage);
                }}
                initialPageSize={20}
              />
            )}
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label>기간</Label>
              <Select value={metricsPeriod} onValueChange={(value: 'day' | 'week' | 'month') => setMetricsPeriod(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">일</SelectItem>
                  <SelectItem value="week">주</SelectItem>
                  <SelectItem value="month">월</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard
                title="CPU 사용률"
                data={cpuChartData}
                isLoading={metricsLoading}
                period={metricsPeriod}
              />
              <ChartCard
                title="메모리 사용률"
                data={memoryChartData}
                isLoading={metricsLoading}
                period={metricsPeriod}
              />
              <ChartCard
                title="요청 수"
                data={requestsChartData}
                isLoading={metricsLoading}
                period={metricsPeriod}
              />
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            {eventLoading ? (
              <LoadingSpinner />
            ) : eventError ? (
              <EmptyState icon={AlertCircle} title="이벤트 데이터를 불러올 수 없습니다" description="서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." />
            ) : eventStatusData ? (
              <div className="space-y-4">
                <StatsCard
                  title="미발행 이벤트"
                  value={eventStatusData.unpublishedCount}
                  icon={Activity}
                  description="처리 대기 중인 이벤트"
                />
                {eventStatusData.recentUnpublishedEvents.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">최근 미발행 이벤트</h3>
                    <div className="space-y-2">
                      {eventStatusData.recentUnpublishedEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="space-y-1">
                            <div className="font-medium">{event.eventType}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.aggregateType}: {event.aggregateId}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(event.occurredAt), 'yyyy-MM-dd HH:mm:ss', {
                                locale: ko,
                              })}
                            </div>
                          </div>
                          <Badge variant={event.published ? 'default' : 'secondary'}>
                            {event.published ? '발행됨' : '미발행'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState icon={Activity} title="이벤트 데이터가 없습니다" description="이벤트 데이터를 불러올 수 없습니다." />
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            {txLoading ? (
              <LoadingSpinner />
            ) : txError ? (
              <EmptyState icon={AlertCircle} title="트랜잭션 데이터를 불러올 수 없습니다" description="서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." />
            ) : txStatusData ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(txStatusData.statusCounts).map(([status, count]) => (
                    <StatsCard
                      key={status}
                      title={status}
                      value={count}
                      icon={Server}
                      description="트랜잭션 수"
                    />
                  ))}
                </div>
                {txStatusData.recentFailures.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">최근 실패한 트랜잭션</h3>
                    <div className="space-y-2">
                      {txStatusData.recentFailures.map((failure) => (
                        <div
                          key={failure.intentId}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="space-y-1">
                            <div className="font-medium">Intent ID: {failure.intentId}</div>
                            <div className="text-sm text-muted-foreground">
                              Entry ID: {failure.entryId}
                            </div>
                            <div className="text-sm text-red-500">
                              {failure.errorCode}: {failure.errorMessage}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(failure.failedAt), 'yyyy-MM-dd HH:mm:ss', {
                                locale: ko,
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState icon={Server} title="트랜잭션 데이터가 없습니다" description="트랜잭션 데이터를 불러올 수 없습니다." />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

