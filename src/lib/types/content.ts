/**
 * 콘텐츠/정책 관련 타입
 */

export enum NoticeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum NoticeCategory {
  GENERAL = 'GENERAL',
  UPDATE = 'UPDATE',
  MAINTENANCE = 'MAINTENANCE',
  EVENT = 'EVENT',
  POLICY = 'POLICY',
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  status: NoticeStatus;
  isPinned: boolean;
  viewCount: number;
  publishedAt?: string;
  startAt?: string;
  endAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Faq {
  id: string;
  categoryId?: string;
  categoryName?: string;
  question: string;
  answer: string;
  isPublished: boolean;
  viewCount: number;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum TermsType {
  SERVICE = 'SERVICE',
  PRIVACY = 'PRIVACY',
  MARKETING = 'MARKETING',
  LOCATION = 'LOCATION',
  THIRD_PARTY = 'THIRD_PARTY',
}

export interface Terms {
  id: string;
  type: TermsType;
  version: string;
  title: string;
  content: string;
  isActive: boolean;
  effectiveDate: string;
  createdBy: string;
  createdAt: string;
}

export interface OperationPolicy {
  id: string;
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
  version: string;
  effectiveDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum BannerPosition {
  HOME_TOP = 'HOME_TOP',
  HOME_MIDDLE = 'HOME_MIDDLE',
  GAME_LIST = 'GAME_LIST',
  DETAIL_BOTTOM = 'DETAIL_BOTTOM',
}

export enum BannerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SCHEDULED = 'SCHEDULED',
  EXPIRED = 'EXPIRED',
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  status: BannerStatus;
  sortOrder: number;
  startAt?: string;
  endAt?: string;
  clickCount: number;
  impressionCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFilterParams {
  status?: string;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
