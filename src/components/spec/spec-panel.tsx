'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { X, Save, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSpecContext } from './hooks/use-spec-context';
import { SpecPanelItem } from './spec-panel-item';
import type { SpecPanelTab, SpecComponent } from './types';

function PanelContent() {
  const context = useSpecContext();
  const { screenData, setPanelOpen, edits, saveEdits, isSaving, getItemStatus, updateUiIndex, pickerActive, setPickerActive } = context!;
  const [activeTab, setActiveTab] = useState<SpecPanelTab>('ui');

  // DnD 센서: 포인터 + 터치 (모바일 Sheet 대응)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  if (!screenData) return null;

  // 피커로 추가된 컴포넌트만 표시
  const allComponents: SpecComponent[] = Object.values(edits)
    .filter((e) => e.status === 'added')
    .map((e) => ({
      id: e.componentId,
      name: e.name || '새 컴포넌트',
      type: e.type || 'custom',
      description: e.description,
      uiIndex: e.uiIndex || 0,
    }));

  // uiIndex 기준 정렬
  const sortedComponents = [...allComponents].sort((a, b) => a.uiIndex - b.uiIndex);

  const sortedIds = sortedComponents.map((c) => c.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedIds.indexOf(active.id as string);
    const newIndex = sortedIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortedComponents, oldIndex, newIndex);
    // 각 컴포넌트의 uiIndex를 1, 2, 3... 으로 재할당
    reordered.forEach((comp, idx) => {
      updateUiIndex(comp.id, idx + 1);
    });
  };

  const hasEdits = Object.keys(edits).length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">
              {screenData.id}: {screenData.name}
            </h3>
            <p className="text-xs text-muted-foreground">{screenData.route}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:hidden"
            onClick={() => setPanelOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 탭 */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as SpecPanelTab)}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="ui" className="text-xs">
            UI 요소
          </TabsTrigger>
          <TabsTrigger value="states" className="text-xs">
            상태
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs">
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ui" className="flex-1 overflow-y-auto px-4 mt-2 space-y-2">
          {sortedComponents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Crosshair className="h-8 w-8 mb-3 opacity-40" />
              <p className="text-sm font-medium">등록된 컴포넌트가 없습니다</p>
              <p className="text-xs mt-1">아래 &quot;화면에서 선택&quot; 버튼으로<br />화면 요소를 선택하고 설명을 추가하세요</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                {sortedComponents.map((comp) => (
                  <SpecPanelItem
                    key={comp.id}
                    component={comp}
                    status={getItemStatus(comp.id)}
                    editedDescription={edits[comp.id]?.description}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="states" className="flex-1 overflow-y-auto px-4 mt-2">
          <div className="space-y-2">
            {screenData.states.map((state) => (
              <div key={state} className="flex items-center gap-2 p-2 border rounded-md">
                <Badge variant="outline" className="text-xs">
                  {state}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="flex-1 overflow-y-auto px-4 mt-2">
          <div className="space-y-2">
            {screenData.apis.map((api, idx) => (
              <div key={idx} className="p-2 border rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={
                      api.method === 'GET'
                        ? 'text-green-600 border-green-600'
                        : api.method === 'POST'
                          ? 'text-blue-600 border-blue-600'
                          : api.method === 'PATCH'
                            ? 'text-yellow-600 border-yellow-600'
                            : 'text-red-600 border-red-600'
                    }
                  >
                    {api.method}
                  </Badge>
                  <code className="text-xs">{api.path}</code>
                </div>
                <p className="text-xs text-muted-foreground">{api.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 하단 액션 */}
      <div className="border-t p-4 space-y-2">
        <Button
          variant={pickerActive ? 'default' : 'outline'}
          size="sm"
          className="w-full text-xs"
          onClick={() => setPickerActive(!pickerActive)}
        >
          <Crosshair className="h-3 w-3 mr-1" />
          {pickerActive ? '피커 종료' : '화면에서 선택'}
        </Button>
        {hasEdits && (
          <Button
            size="sm"
            className="w-full text-xs"
            onClick={saveEdits}
            disabled={isSaving}
          >
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </Button>
        )}
      </div>
    </div>
  );
}

export function SpecPanel() {
  const context = useSpecContext();

  if (!context || context.mode !== 'spec') return null;

  const { panelOpen, setPanelOpen } = context;

  return (
    <>
      {/* 데스크톱: 항상 표시되는 레이아웃 패널 */}
      <aside data-spec-panel className="hidden md:flex w-[360px] border-l bg-background flex-col overflow-hidden shrink-0">
        <PanelContent />
      </aside>

      {/* 모바일: Sheet (panelOpen으로 제어) */}
      <div className="md:hidden">
        <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
          <SheetContent side="right" className="w-[360px] p-0" data-spec-panel>
            <SheetTitle className="sr-only">화면설계서 패널</SheetTitle>
            <PanelContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
