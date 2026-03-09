'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

// pathname 세그먼트 → 한국어 라벨 매핑
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: '대시보드',
  users: '사용자 관리',
  games: '게임 관리',
  products: '상품 관리',
  blockchain: '블록체인',
  storage: '파일 관리',
  monitoring: '모니터링',
  settings: '설정',
  profile: '프로필',
  new: '신규 등록',
  edit: '수정',
};

/** pathname 세그먼트를 읽기 좋은 라벨로 변환 */
function segmentToLabel(segment: string): string {
  // 숫자 ID 패턴이면 "#ID" 형태로 표시
  if (/^\d+$/.test(segment)) return `#${segment}`;
  return SEGMENT_LABELS[segment] ?? segment;
}

interface BreadcrumbItem {
  label: string;
  href: string;
}

/** pathname을 브레드크럼 배열로 변환 */
function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let accumulatedPath = '';
  for (const segment of segments) {
    accumulatedPath += `/${segment}`;
    items.push({
      label: segmentToLabel(segment),
      href: accumulatedPath,
    });
  }
  return items;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  /** 브레드크럼 표시 여부 (기본값: true) */
  showBreadcrumb?: boolean;
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
}

export function PageHeader({
  title,
  description,
  showBreadcrumb = true,
  action,
}: PageHeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        {/* 브레드크럼 — 세그먼트가 2개 이상일 때만 표시 */}
        {showBreadcrumb && breadcrumbs.length > 1 && (
          <nav
            aria-label="브레드크럼"
            className="flex items-center space-x-1 text-sm text-muted-foreground"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={crumb.href} className="flex items-center space-x-1">
                  {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                  {isLast ? (
                    // 현재 페이지는 링크 없이 텍스트로
                    <span className="font-medium text-foreground">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>
        )}

        {/* 페이지 제목 */}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

        {/* 설명 */}
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* 액션 버튼 */}
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
