'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from './loading-spinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartCardProps {
  title: string;
  description?: string;
  data?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      [key: string]: unknown;
    }>;
  };
  isLoading?: boolean;
  period?: 'day' | 'week' | 'month' | 'year';
  onPeriodChange?: (period: 'day' | 'week' | 'month' | 'year') => void;
}

export function ChartCard({ title, description, data, isLoading, period = 'month', onPeriodChange }: ChartCardProps) {
  // Transform API data format to recharts format
  const chartData = data?.labels.map((label, index) => {
    const item: Record<string, string | number> = { name: label };
    data.datasets.forEach((dataset) => {
      item[dataset.label] = dataset.data[index] || 0;
    });
    return item;
  }) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {onPeriodChange && (
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">일</SelectItem>
              <SelectItem value="week">주</SelectItem>
              <SelectItem value="month">월</SelectItem>
              <SelectItem value="year">년</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            데이터가 없습니다
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              {data?.datasets.map((dataset, index) => {
                const colors = [
                  'hsl(var(--primary))',
                  'hsl(var(--chart-2))',
                  'hsl(var(--chart-3))',
                  'hsl(var(--chart-4))',
                ];
                const fallbackColors = [
                  'hsl(221.2 83.2% 53.3%)', // primary blue
                  'hsl(142.1 76.2% 36.3%)', // green
                  'hsl(262.1 83.3% 57.8%)', // purple
                  'hsl(0 72.2% 50.6%)', // red
                ];
                return (
                  <Line
                    key={dataset.label}
                    type="monotone"
                    dataKey={dataset.label}
                    stroke={colors[index] || fallbackColors[index] || fallbackColors[0]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

