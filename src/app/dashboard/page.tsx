'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gamepad2, Image, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Overview of your BlockPick platform"
        />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value="12,543"
            icon={Users}
            description="from last month"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Active Games"
            value="48"
            icon={Gamepad2}
            description="from last month"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="NFTs Minted"
            value="3,847"
            icon={Image}
            description="from last month"
            trend={{ value: 23.1, isPositive: true }}
          />
          <StatsCard
            title="Revenue"
            value="$45,231"
            icon={TrendingUp}
            description="from last month"
            trend={{ value: -4.3, isPositive: false }}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, activity: 'New user registered', time: '2m ago' },
                  { id: 2, activity: 'Game completed', time: '5m ago' },
                  { id: 3, activity: 'NFT minted', time: '10m ago' },
                  { id: 4, activity: 'Payment received', time: '15m ago' },
                  { id: 5, activity: 'Level unlocked', time: '20m ago' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.activity}</p>
                      <p className="text-xs text-muted-foreground">
                        Recent platform activity
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, name: 'BlockPick Adventure', plays: 8432, rating: 4.8 },
                  { id: 2, name: 'NFT Quest', plays: 6521, rating: 4.5 },
                  { id: 3, name: 'Crypto Challenge', plays: 5234, rating: 4.2 },
                  { id: 4, name: 'Token Tower', plays: 4123, rating: 4.0 },
                  { id: 5, name: 'Web3 Warriors', plays: 3456, rating: 3.9 },
                ].map((game) => (
                  <div key={game.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded bg-muted" />
                      <div>
                        <p className="text-sm font-medium">{game.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {game.plays.toLocaleString()} plays
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{game.rating}</p>
                      <p className="text-xs text-muted-foreground">rating</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
