'use client';

import { createContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { SpecMode, SpecContextValue } from './types';
import { useSpecData } from './hooks/use-spec-data';
import { useSpecEdits } from './hooks/use-spec-edits';

export const SpecContext = createContext<SpecContextValue | null>(null);

const MODE_KEY = 'spec-mode';

function getInitialMode(): SpecMode {
  if (typeof window === 'undefined') return 'crm';
  return (localStorage.getItem(MODE_KEY) as SpecMode) || 'crm';
}

export function SpecProvider({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development';
  const [mode, setModeState] = useState<SpecMode>(getInitialMode);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemIdState] = useState<string | null>(null);
  const [pickerActive, setPickerActive] = useState(false);
  const componentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const panelItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { screenData, isLoading, screenId } = useSpecData();
  const {
    edits,
    updateEdit: rawUpdateEdit,
    updateUiIndex: rawUpdateUiIndex,
    addComponent: rawAddComponent,
    removeEdit,
    saveEdits,
    isSaving,
    getItemStatus,
  } = useSpecEdits(screenId);

  const setMode = useCallback((newMode: SpecMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_KEY, newMode);
    if (newMode === 'crm') {
      setPanelOpen(false);
      setActiveItemId(null);
    }
  }, []);

  const updateEdit = useCallback(
    (componentId: string, description: string) => {
      rawUpdateEdit(componentId, description);
    },
    [rawUpdateEdit],
  );

  const updateUiIndex = useCallback(
    (componentId: string, uiIndex: number) => {
      rawUpdateUiIndex(componentId, uiIndex);
    },
    [rawUpdateUiIndex],
  );

  const addComponent = useCallback(
    (name: string, type: string, description: string, cssSelector?: string) => {
      if (!screenId) return;
      const maxIndex = Math.max(
        ...Object.values(edits)
          .filter((e) => e.status === 'added' && e.uiIndex !== undefined)
          .map((e) => e.uiIndex!),
        0,
      );
      rawAddComponent(name, type, description, maxIndex + 1, screenId, cssSelector);
    },
    [rawAddComponent, screenId, edits],
  );

  // selectedItemId 변경 시 activeItemId와 동기화
  const setSelectedItemId = useCallback(
    (id: string | null) => {
      setSelectedItemIdState(id);
      if (id) {
        setActiveItemId(id);
        // 패널 아이템으로 스크롤
        requestAnimationFrame(() => {
          const panelEl = panelItemRefs.current.get(id);
          panelEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    },
    [],
  );

  // 글로벌 키보드: Escape → 선택 해제
  useEffect(() => {
    if (mode !== 'spec') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItemIdState(null);
        setHoveredItemId(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  // 글로벌 클릭 차단: spec 모드에서 메인 콘텐츠 전체 클릭 차단
  useEffect(() => {
    if (mode !== 'spec') return;
    const blockClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // spec-badge 클릭은 허용 (컴포넌트 선택용)
      if (target.closest('[data-spec-badge]')) return;
      // spec-panel 내부 클릭은 허용 (패널은 정상 동작)
      if (target.closest('[data-spec-panel]')) return;
      // 동적 라벨 클릭은 허용 (피커로 추가된 컴포넌트 선택용)
      if (target.closest('[data-spec-dynamic-label]')) return;
      // 다이얼로그 (Radix Portal) 클릭은 허용
      if (target.closest('[role="dialog"]') || target.closest('[data-radix-popper-content-wrapper]')) return;
      // 그 외 메인 콘텐츠 전체 기본 동작 차단 (링크, 버튼, 라우팅 등)
      e.preventDefault();
    };
    // capture 단계에서 차단 → 자식 핸들러보다 먼저 실행
    document.addEventListener('click', blockClicks, true);
    return () => document.removeEventListener('click', blockClicks, true);
  }, [mode]);

  // 라우트(screenId) 변경 시 선택/호버 초기화
  useEffect(() => {
    setSelectedItemIdState(null);
    setHoveredItemId(null);
  }, [screenId]);

  const value = useMemo<SpecContextValue>(
    () => ({
      mode: isDev ? mode : 'crm',
      setMode,
      screenData,
      isLoading,
      activeItemId,
      setActiveItemId,
      panelOpen,
      setPanelOpen,
      edits,
      updateEdit,
      updateUiIndex,
      addComponent,
      removeEdit,
      saveEdits,
      isSaving,
      getItemStatus,
      hoveredItemId,
      setHoveredItemId,
      selectedItemId,
      setSelectedItemId,
      componentRefs,
      panelItemRefs,
      pickerActive,
      setPickerActive,
    }),
    [
      isDev,
      mode,
      setMode,
      screenData,
      isLoading,
      activeItemId,
      panelOpen,
      edits,
      updateEdit,
      updateUiIndex,
      addComponent,
      removeEdit,
      saveEdits,
      isSaving,
      getItemStatus,
      hoveredItemId,
      selectedItemId,
      setSelectedItemId,
      pickerActive,
    ],
  );

  if (!isDev) return <>{children}</>;

  return <SpecContext.Provider value={value}>{children}</SpecContext.Provider>;
}
