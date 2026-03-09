'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSpecContext } from './hooks/use-spec-context';
import { SpecAddDialog } from './spec-add-dialog';

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// DOM 요소에서 의미있는 이름 추출
function getElementName(el: HTMLElement): string {
  if (el.dataset.specLabel) return el.dataset.specLabel;
  if (el.getAttribute('role')) return el.getAttribute('role')!;
  const tag = el.tagName.toLowerCase();
  const cls = el.className;
  if (typeof cls === 'string') {
    if (cls.includes('card')) return `${tag}:Card`;
    if (cls.includes('button')) return `${tag}:Button`;
    if (cls.includes('header')) return `${tag}:Header`;
    if (cls.includes('table')) return `${tag}:Table`;
  }
  const text = el.textContent?.trim();
  if (text && text.length < 30 && text.length > 0) {
    return `${tag}: "${text.slice(0, 20)}"`;
  }
  return tag;
}

// 부모 체인 탐색
function getAncestorChain(el: HTMLElement): HTMLElement[] {
  const chain: HTMLElement[] = [el];
  let current = el.parentElement;
  while (current && current !== document.body) {
    if (current.dataset.specPanel !== undefined) break;
    chain.push(current);
    current = current.parentElement;
  }
  return chain;
}

// DOM 요소 → 고유 CSS 셀렉터 생성
function computeCssSelector(el: HTMLElement): string {
  if (el.id) return `#${CSS.escape(el.id)}`;

  const parts: string[] = [];
  let current: HTMLElement | null = el;

  while (current && current !== document.body && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }

    // data-spec-label이 있으면 해당 속성으로 단축
    const specLabel = current.getAttribute('data-spec-label');
    if (specLabel) {
      parts.unshift(`[data-spec-label="${specLabel}"]`);
      break;
    }

    const parent = current.parentElement;
    if (parent) {
      const sameTagSiblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName,
      );
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

export function SpecElementPicker() {
  const context = useSpecContext();
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const [ancestorChain, setAncestorChain] = useState<HTMLElement[]>([]);
  const [chainIndex, setChainIndex] = useState(0);
  const [label, setLabel] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCssSelector, setSelectedCssSelector] = useState('');

  const isActive = context?.pickerActive && context.mode === 'spec';

  const updateHighlight = useCallback((el: HTMLElement | null) => {
    if (!el) {
      setHighlight(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setHighlight({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  // 피커 활성 시 body에 커서 스타일 적용
  useEffect(() => {
    if (isActive) {
      document.body.style.cursor = 'crosshair';
      return () => { document.body.style.cursor = ''; };
    }
  }, [isActive]);

  // 마우스 이동 → 요소 감지
  useEffect(() => {
    if (!isActive) {
      setHighlight(null);
      setTargetEl(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el || el.closest('[data-spec-panel]')) {
        setHighlight(null);
        setTargetEl(null);
        setLabel('');
        return;
      }

      const chain = getAncestorChain(el);
      setAncestorChain(chain);
      setChainIndex(0);

      const target = chain[0];
      setTargetEl(target);
      updateHighlight(target);
      setLabel(getElementName(target));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isActive, updateHighlight]);

  // 마우스 휠 → 부모/자식 레벨 전환
  useEffect(() => {
    if (!isActive || ancestorChain.length <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setChainIndex((prev) => {
        const next = e.deltaY > 0
          ? Math.min(prev + 1, ancestorChain.length - 1)
          : Math.max(prev - 1, 0);

        const target = ancestorChain[next];
        setTargetEl(target);
        updateHighlight(target);
        setLabel(getElementName(target));
        return next;
      });
    };

    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => document.removeEventListener('wheel', handleWheel, true);
  }, [isActive, ancestorChain, updateHighlight]);

  // 클릭 → 요소 확정 (elementFromPoint 사용으로 오버레이 무관)
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (e: MouseEvent) => {
      // 패널 UI 클릭은 무시
      const clicked = e.target as HTMLElement;
      if (clicked.closest('[data-spec-panel]')) return;

      e.preventDefault();
      e.stopPropagation();

      if (targetEl) {
        // CSS 셀렉터 계산 → 피커 비활성화 → 다이얼로그 열기
        setSelectedCssSelector(computeCssSelector(targetEl));
        context?.setPickerActive(false);
        setAddDialogOpen(true);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isActive, targetEl]);

  // ESC → 피커 종료
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        context?.setPickerActive(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, context]);

  const handleAddDialogClose = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setHighlight(null);
      setTargetEl(null);
      setSelectedCssSelector('');
    }
  };

  if (!isActive && !addDialogOpen) return null;

  return createPortal(
    <>
      {/* 하이라이트 오버레이 (pointer-events: none → 클릭 투과) */}
      {isActive && highlight && (
        <div className="fixed inset-0 z-[9998] pointer-events-none">
          {/* 하이라이트 박스 */}
          <div
            className="absolute border-2 border-green-500 bg-green-500/10 rounded-sm transition-all duration-75"
            style={{
              top: highlight.top,
              left: highlight.left,
              width: highlight.width,
              height: highlight.height,
            }}
          />
          {/* 요소 이름 라벨 */}
          <div
            className="absolute bg-green-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-sm whitespace-nowrap"
            style={{
              top: Math.max(0, highlight.top - 20),
              left: highlight.left,
            }}
          >
            {label}
            {ancestorChain.length > 1 && (
              <span className="ml-1 opacity-70">
                (깊이 {chainIndex + 1}/{ancestorChain.length})
              </span>
            )}
          </div>
        </div>
      )}

      {/* 상단 안내 바 */}
      {isActive && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 pointer-events-none">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
          요소를 클릭하세요 · 스크롤로 부모↔자식 전환 · ESC 취소
        </div>
      )}

      {/* 추가 다이얼로그 */}
      <SpecAddDialog
        open={addDialogOpen}
        onOpenChange={handleAddDialogClose}
        defaultName={label}
        cssSelector={selectedCssSelector || undefined}
      />
    </>,
    document.body,
  );
}
