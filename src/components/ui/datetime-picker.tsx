'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';

interface DateTimePickerProps {
  id?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  id,
  label,
  value,
  onChange,
  placeholder = 'YYYY-MM-DD HH:MM',
  disabled = false,
  className = '',
}: DateTimePickerProps) {
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 초기값 설정
  useEffect(() => {
    if (value) {
      try {
        // ISO 형식 또는 datetime-local 형식 모두 처리
        let date: Date;
        if (value.includes('T')) {
          // ISO 형식 또는 datetime-local 형식
          date = new Date(value);
        } else {
          // 날짜만 있는 경우
          date = new Date(value);
        }
        if (isValid(date) && !isNaN(date.getTime())) {
          setDateValue(format(date, 'yyyy-MM-dd'));
          setTimeValue(format(date, 'HH:mm'));
        } else {
          setDateValue('');
          setTimeValue('');
        }
      } catch (e) {
        setDateValue('');
        setTimeValue('');
      }
    } else {
      setDateValue('');
      setTimeValue('');
    }
  }, [value]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate);
    updateValue(newDate, timeValue);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    updateValue(dateValue, newTime);
  };

  const updateValue = (date: string, time: string) => {
    if (date && time) {
      try {
        const dateTimeString = `${date}T${time}:00`;
        const dateTime = parse(dateTimeString, "yyyy-MM-dd'T'HH:mm:ss", new Date());
        if (isValid(dateTime)) {
          onChange?.(dateTime.toISOString());
        }
      } catch (e) {
        // 무시
      }
    } else if (date) {
      // 날짜만 있는 경우
      onChange?.(`${date}T00:00:00`);
    } else {
      onChange?.('');
    }
  };

  const handleNow = () => {
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');
    const timeStr = format(now, 'HH:mm');
    setDateValue(dateStr);
    setTimeValue(timeStr);
    updateValue(dateStr, timeStr);
    setIsOpen(false);
  };

  // 시간 옵션 생성 (24시간 형식)
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={dateValue && timeValue ? `${dateValue} ${timeValue}` : ''}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="cursor-pointer pr-10"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 bg-popover border rounded-lg shadow-lg p-4 w-[400px]">
            <div className="space-y-4">
              {/* 날짜 선택 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">날짜 선택</Label>
                <Input
                  type="date"
                  value={dateValue}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* 시간 선택 (24시간 형식) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">시간 선택 (24시간 형식)</Label>
                <div className="flex items-center gap-2">
                  <select
                    value={timeValue.split(':')[0] || '00'}
                    onChange={(e) => {
                      const newTime = `${e.target.value}:${timeValue.split(':')[1] || '00'}`;
                      handleTimeChange(newTime);
                    }}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}시
                      </option>
                    ))}
                  </select>
                  <span className="text-muted-foreground">:</span>
                  <select
                    value={timeValue.split(':')[1] || '00'}
                    onChange={(e) => {
                      const newTime = `${timeValue.split(':')[0] || '00'}:${e.target.value}`;
                      handleTimeChange(newTime);
                    }}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {minutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}분
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex justify-between pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setDateValue('');
                    setTimeValue('');
                    onChange?.('');
                    setIsOpen(false);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  삭제
                </button>
                <button
                  type="button"
                  onClick={handleNow}
                  className="text-sm text-primary hover:underline"
                >
                  지금
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

