'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSpecContext } from './hooks/use-spec-context';
import { cn } from '@/lib/utils';

interface LabelPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const statusColors = {
  original: 'bg-yellow-400 text-yellow-900',
  modified: 'bg-orange-400 text-orange-900',
  added: 'bg-green-400 text-green-900',
} as const;

/**
 * 피커로 추가된 컴포넌트(cssSelector 있는 edits)를 화면에 동적 라벨로 렌더링.
 * SpecLabel처럼 뱃지 + 호버/선택 아웃라인을 제공하되, portal 오버레이로 동작.
 */
export function SpecDynamicLabels() {
  const context = useSpecContext();
  const [positions, setPositions] = useState<Record<string, LabelPosition>>({});

  // 포지션 갱신
  const updatePositions = useCallback(() => {
    if (!context) return;
    const { edits, componentRefs } = context;

    const next: Record<string, LabelPosition> = {};
    for (const [id, edit] of Object.entries(edits)) {
      if (!edit.cssSelector) continue;
      try {
        const el = document.querySelector(edit.cssSelector) as HTMLElement | null;
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        next[id] = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
        // componentRefs에 등록 → 패널 호버 시 화면 하이라이트 연동
        componentRefs.current.set(id, el as HTMLDivElement);
      } catch {
        // 유효하지 않은 셀렉터 무시
      }
    }
    setPositions(next);
  }, [context]);

  useEffect(() => {
    if (!context || context.mode !== 'spec') {
      setPositions({});
      return;
    }

    // cssSelector가 있는 edit가 하나도 없으면 스킵
    const hasDynamic = Object.values(context.edits).some((e) => e.cssSelector);
    if (!hasDynamic) {
      setPositions({});
      return;
    }

    updatePositions();

    // 스크롤/리사이즈 시 위치 갱신
    const mainEl = document.querySelector('main');
    const handleUpdate = () => requestAnimationFrame(updatePositions);

    mainEl?.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      mainEl?.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      // componentRefs 정리
      if (context) {
        for (const id of Object.keys(context.edits)) {
          if (context.edits[id]?.cssSelector) {
            context.componentRefs.current.delete(id);
          }
        }
      }
    };
  }, [context, context?.mode, context?.edits, updatePositions]);

  if (!context || context.mode !== 'spec') return null;

  const { hoveredItemId, setHoveredItemId, selectedItemId, setSelectedItemId, edits, getItemStatus } = context;

  const dynamicEntries = Object.entries(edits).filter(([, e]) => e.cssSelector);
  if (dynamicEntries.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 pointer-events-none">
      {dynamicEntries.map(([id, edit]) => {
        const pos = positions[id];
        if (!pos) return null;

        const isHovered = hoveredItemId === id;
        const isSelected = selectedItemId === id;
        const status = getItemStatus(id);
        const displayIndex = edit.uiIndex || 0;

        return (
          <div key={id}>
            {/* 호버/선택 아웃라인 */}
            <div
              className={cn(
                'absolute transition-all duration-75',
                isHovered && !isSelected && 'ring-1 ring-blue-400/60 bg-blue-400/5',
                isSelected && 'ring-2 ring-blue-500 ring-offset-1 bg-blue-500/5',
              )}
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height,
              }}
            />

            {/* 클릭 영역 (pointer-events 활성화) */}
            <div
              data-spec-dynamic-label
              className="absolute cursor-pointer pointer-events-auto"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height,
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedItemId(id);
              }}
              onMouseEnter={() => setHoveredItemId(id)}
              onMouseLeave={() => {
                if (hoveredItemId === id) setHoveredItemId(null);
              }}
            />

            {/* 번호 뱃지 */}
            <div
              data-spec-dynamic-label
              className={cn(
                'absolute z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-md cursor-pointer pointer-events-auto transition-all hover:scale-110',
                statusColors[status],
                isSelected && 'ring-2 ring-blue-500 ring-offset-1',
              )}
              style={{
                top: pos.top - 8,
                left: pos.left - 8,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItemId(id);
              }}
            >
              {displayIndex}
            </div>

            {/* 선택된 컴포넌트 이름 라벨 */}
            {isSelected && (
              <div
                className="absolute z-10 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded-sm whitespace-nowrap"
                style={{
                  top: pos.top - 20,
                  left: pos.left + 24,
                }}
              >
                {edit.name || id}
              </div>
            )}
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
