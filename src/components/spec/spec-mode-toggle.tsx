'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpecContext } from './hooks/use-spec-context';
import type { SpecMode } from './types';

export function SpecModeToggle() {
  const context = useSpecContext();

  if (process.env.NODE_ENV !== 'development' || !context) return null;

  const { mode, setMode } = context;

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as SpecMode)}>
      <TabsList className="h-8">
        <TabsTrigger value="crm" className="text-xs px-3 h-7">
          CRM 모드
        </TabsTrigger>
        <TabsTrigger value="spec" className="text-xs px-3 h-7">
          화면설계서 모드
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
