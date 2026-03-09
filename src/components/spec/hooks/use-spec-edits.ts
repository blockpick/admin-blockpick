'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SpecEdit, SpecItemStatus } from '../types';

const STORAGE_PREFIX = 'spec-edits';

function getStorageKey(screenId: string) {
  return `${STORAGE_PREFIX}-${screenId}`;
}

export function useSpecEdits(screenId: string | null) {
  const [edits, setEdits] = useState<Record<string, SpecEdit>>({});
  const [isSaving, setIsSaving] = useState(false);

  // localStorage에서 edits 로드
  useEffect(() => {
    if (!screenId) {
      setEdits({});
      return;
    }
    try {
      const stored = localStorage.getItem(getStorageKey(screenId));
      if (stored) {
        setEdits(JSON.parse(stored));
      } else {
        setEdits({});
      }
    } catch {
      setEdits({});
    }
  }, [screenId]);

  // localStorage에 edits 저장
  const persistToLocal = useCallback(
    (newEdits: Record<string, SpecEdit>) => {
      if (!screenId) return;
      localStorage.setItem(getStorageKey(screenId), JSON.stringify(newEdits));
    },
    [screenId],
  );

  // 기존 컴포넌트 설명 수정
  const updateEdit = useCallback(
    (componentId: string, description: string) => {
      setEdits((prev) => {
        const existing = prev[componentId];
        const edit: SpecEdit = {
          componentId,
          description,
          editedAt: new Date().toISOString(),
          status: existing?.status === 'added' ? 'added' : 'modified',
          ...(existing?.name ? { name: existing.name } : {}),
          ...(existing?.type ? { type: existing.type } : {}),
          ...(existing?.uiIndex !== undefined ? { uiIndex: existing.uiIndex } : {}),
          ...(existing?.cssSelector ? { cssSelector: existing.cssSelector } : {}),
        };
        const next = { ...prev, [componentId]: edit };
        persistToLocal(next);
        return next;
      });
    },
    [persistToLocal],
  );

  // uiIndex 수정
  const updateUiIndex = useCallback(
    (componentId: string, uiIndex: number) => {
      setEdits((prev) => {
        const existing = prev[componentId];
        const edit: SpecEdit = {
          componentId,
          description: existing?.description ?? '',
          editedAt: new Date().toISOString(),
          status: existing?.status === 'added' ? 'added' : 'modified',
          ...(existing?.name ? { name: existing.name } : {}),
          ...(existing?.type ? { type: existing.type } : {}),
          ...(existing?.cssSelector ? { cssSelector: existing.cssSelector } : {}),
          uiIndex,
        };
        const next = { ...prev, [componentId]: edit };
        persistToLocal(next);
        return next;
      });
    },
    [persistToLocal],
  );

  // 새 컴포넌트 추가
  const addComponent = useCallback(
    (name: string, type: string, description: string, uiIndex: number, sid: string, cssSelector?: string) => {
      const componentId = `${sid}-NEW-${Date.now()}`;
      setEdits((prev) => {
        const edit: SpecEdit = {
          componentId,
          description,
          editedAt: new Date().toISOString(),
          status: 'added',
          name,
          type,
          uiIndex,
          ...(cssSelector ? { cssSelector } : {}),
        };
        const next = { ...prev, [componentId]: edit };
        persistToLocal(next);
        return next;
      });
    },
    [persistToLocal],
  );

  // 수정/추가된 항목 삭제 (added → 완전 삭제, modified → 원본 복원)
  const removeEdit = useCallback(
    (componentId: string) => {
      setEdits((prev) => {
        const { [componentId]: _, ...rest } = prev;
        persistToLocal(rest);
        return rest;
      });
    },
    [persistToLocal],
  );

  // _edits.json에 저장 (API PATCH)
  const saveEdits = useCallback(async () => {
    if (!screenId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/spec/${screenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edits }),
      });
    } finally {
      setIsSaving(false);
    }
  }, [screenId, edits]);

  const getItemStatus = useCallback(
    (componentId: string): SpecItemStatus => {
      const edit = edits[componentId];
      if (!edit) return 'original';
      return edit.status;
    },
    [edits],
  );

  return { edits, updateEdit, updateUiIndex, addComponent, removeEdit, saveEdits, isSaving, getItemStatus };
}
