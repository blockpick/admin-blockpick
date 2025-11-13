/**
 * System monitoring types based on OpenAPI spec
 */

export interface SystemHealthStatus {
  status: string;
  timestamp: string;
  metrics: SystemMetrics;
  alerts: SystemAlert[];
}

export interface SystemMetrics {
  unpublishedEvents: number;
  pendingTransactions: number;
  sentTransactions: number;
  failedTransactions: number;
}

export interface SystemAlert {
  level: string;
  message: string;
  component: string;
}

export interface TransactionStatus {
  statusCounts: Record<string, number>;
  recentFailures: FailedTransactionInfo[];
}

export interface FailedTransactionInfo {
  intentId: string;
  entryId: string;
  errorCode: string;
  errorMessage: string;
  failedAt: string;
}

export interface EventInfo {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  occurredAt: string;
  published: boolean;
}

export interface EventStatus {
  unpublishedCount: number;
  recentUnpublishedEvents: EventInfo[];
}

