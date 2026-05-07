/**
 * 신고/제재 관련 타입
 */

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  PROCESSED = 'PROCESSED',
  DISMISSED = 'DISMISSED',
}

export enum ReportType {
  GAME = 'GAME',
  USER = 'USER',
  PARTNER = 'PARTNER',
  CONTENT = 'CONTENT',
  OTHER = 'OTHER',
}

export enum ReportReason {
  SPAM = 'SPAM',
  FRAUD = 'FRAUD',
  INAPPROPRIATE = 'INAPPROPRIATE',
  ILLEGAL = 'ILLEGAL',
  COPYRIGHT = 'COPYRIGHT',
  OTHER = 'OTHER',
}

export enum SanctionType {
  WARNING = 'WARNING',
  SUSPEND_7 = 'SUSPEND_7',
  SUSPEND_30 = 'SUSPEND_30',
  PERMANENT_BAN = 'PERMANENT_BAN',
  CONTENT_REMOVAL = 'CONTENT_REMOVAL',
  FORCE_END = 'FORCE_END',
}

export interface Report {
  id: string;
  type: ReportType;
  reason: ReportReason;
  status: ReportStatus;
  targetId: string;
  targetName: string;
  reporterUserId?: string;
  reporterEmail?: string;
  description?: string;
  evidenceUrls?: string[];
  processedAt?: string;
  processedBy?: string;
  processingNote?: string;
  sanctionApplied?: SanctionType;
  createdAt: string;
  updatedAt: string;
}

export interface Sanction {
  id: string;
  reportId?: string;
  targetId: string;
  targetName: string;
  targetType: ReportType;
  sanctionType: SanctionType;
  reason: string;
  appliedAt: string;
  appliedBy: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface ReportFilterParams {
  status?: ReportStatus;
  type?: ReportType;
  reason?: ReportReason;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProcessReportRequest {
  reportId: string;
  processingNote: string;
  sanctionType?: SanctionType;
}

export interface ReportStats {
  total: number;
  pending: number;
  inReview: number;
  processed: number;
  dismissed: number;
}
