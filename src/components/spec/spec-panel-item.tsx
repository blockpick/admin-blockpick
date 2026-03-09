'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X, GripVertical, Trash2, RotateCcw } from 'lucide-react';
import { useSpecContext } from './hooks/use-spec-context';
import type { SpecComponent, SpecItemStatus } from './types';
import { cn } from '@/lib/utils';

interface SpecPanelItemProps {
  component: SpecComponent;
  status: SpecItemStatus;
  editedDescription?: string;
}

const statusIndicators = {
  original: 'border-l-yellow-400',
  modified: 'border-l-orange-400',
  added: 'border-l-green-400',
} as const;

export function SpecPanelItem({ component, status, editedDescription }: SpecPanelItemProps) {
  const context = useSpecContext();
  const {
    activeItemId, updateEdit, updateUiIndex, removeEdit,
    hoveredItemId, setHoveredItemId, selectedItemId, setSelectedItemId,
    panelItemRefs,
  } = context!;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isEditingIndex, setIsEditingIndex] = useState(false);
  const [indexText, setIndexText] = useState('');
  const indexInputRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  // useSortable 통합 (편집 중 드래그 비활성화)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id, disabled: isEditing || isEditingIndex });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = activeItemId === component.id;
  const isHovered = hoveredItemId === component.id;
  const isSelected = selectedItemId === component.id;
  const displayDescription = editedDescription ?? component.description;

  // 패널 아이템 DOM ref 등록
  useEffect(() => {
    const el = itemRef.current;
    if (el) {
      panelItemRefs.current.set(component.id, el);
    }
    return () => {
      panelItemRefs.current.delete(component.id);
    };
  }, [component.id, panelItemRefs]);

  // 화면에서 선택 시 패널 아이템으로 스크롤
  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  useEffect(() => {
    if (isEditingIndex && indexInputRef.current) {
      indexInputRef.current.focus();
      indexInputRef.current.select();
    }
  }, [isEditingIndex]);

  const handleStartIndexEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndexText(String(component.uiIndex));
    setIsEditingIndex(true);
  };

  const handleSaveIndex = () => {
    const parsed = parseInt(indexText, 10);
    if (!isNaN(parsed) && parsed > 0) {
      updateUiIndex(component.id, parsed);
    }
    setIsEditingIndex(false);
  };

  const handleIndexKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveIndex();
    } else if (e.key === 'Escape') {
      setIsEditingIndex(false);
    }
  };

  const handleStartEdit = () => {
    setEditText(displayDescription);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateEdit(component.id, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText('');
  };

  const handleItemClick = () => {
    setSelectedItemId(component.id);
  };

  // 패널 → 화면 호버 싱크
  const handleMouseEnter = () => setHoveredItemId(component.id);
  const handleMouseLeave = () => setHoveredItemId(null);

  // sortable + 로컬 ref 결합
  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (itemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      className={cn(
        'border-l-4 p-3 rounded-r-md cursor-pointer transition-colors flex gap-1',
        statusIndicators[status],
        isActive || isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : '',
        isHovered && !isActive && !isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : '',
        !isActive && !isSelected && !isHovered ? 'hover:bg-muted/50' : '',
      )}
      onClick={handleItemClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 드래그 핸들 */}
      <div
        className={cn(
          'flex items-center shrink-0 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing',
          (isEditing || isEditingIndex) && 'opacity-30 pointer-events-none',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {isEditingIndex ? (
              <Input
                ref={indexInputRef}
                type="number"
                min={1}
                value={indexText}
                onChange={(e) => setIndexText(e.target.value)}
                onBlur={handleSaveIndex}
                onKeyDown={handleIndexKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-10 px-1 text-center text-[10px] font-bold"
              />
            ) : (
              <button
                onClick={handleStartIndexEdit}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold hover:bg-yellow-400 hover:text-yellow-900 transition-colors cursor-pointer"
                title="번호 수정"
              >
                {component.uiIndex}
              </button>
            )}
            <span className="text-sm font-medium truncate">{component.name}</span>
          </div>
          {!isEditing && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit();
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              {status === 'added' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEdit(component.id);
                  }}
                  title="삭제"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              {status === 'modified' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEdit(component.id);
                  }}
                  title="원본 복원"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="text-xs min-h-[60px]"
              autoFocus
            />
            <div className="flex gap-1 justify-end">
              <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                취소
              </Button>
              <Button size="sm" className="h-6 text-xs" onClick={handleSave}>
                <Check className="h-3 w-3 mr-1" />
                저장
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
            {displayDescription}
          </p>
        )}
      </div>
    </div>
  );
}
