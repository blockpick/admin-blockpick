'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSpecContext } from './hooks/use-spec-context';

interface SpecAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  cssSelector?: string;
}

const COMPONENT_TYPES = [
  { value: 'header', label: '헤더' },
  { value: 'stats', label: '통계' },
  { value: 'filter', label: '필터' },
  { value: 'table', label: '테이블' },
  { value: 'dialog', label: '다이얼로그' },
  { value: 'display', label: '디스플레이' },
  { value: 'chart', label: '차트' },
  { value: 'list', label: '리스트' },
  { value: 'form', label: '폼' },
  { value: 'custom', label: '기타' },
];

export function SpecAddDialog({ open, onOpenChange, defaultName, cssSelector }: SpecAddDialogProps) {
  const context = useSpecContext();
  const { addComponent } = context!;
  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  const [description, setDescription] = useState('');

  // 다이얼로그 열릴 때 defaultName 반영
  useEffect(() => {
    if (open && defaultName) {
      setName(defaultName);
    }
  }, [open, defaultName]);

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return;
    addComponent(name.trim(), type, description.trim(), cssSelector);
    setName('');
    setType('custom');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>디스크립션 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comp-name">컴포넌트 이름</Label>
            <Input
              id="comp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: CustomButton"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-type">타입</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="comp-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPONENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-desc">설명</Label>
            <Textarea
              id="comp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="컴포넌트에 대한 기획 설명을 작성하세요"
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !description.trim()}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
