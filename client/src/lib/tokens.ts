import { ReadinessStatus } from '@/types/assessment';
import { DocumentStatus } from '@/types/document';
import { TicketPriority, TicketStatus } from '@/types/ticket';

export const tokens = {
  page: 'dashboard-page',
  card: 'dashboard-card',
  focusRing:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50 focus-visible:ring-offset-2',
} as const;

export const ticketStatusBadge: Record<TicketStatus, string> = {
  OPEN: 'bg-brand-muted text-brand-deep border-brand-accent/20',
  IN_PROGRESS: 'bg-warning-50 text-warning-700 border-warning-100',
  RESOLVED: 'bg-success-50 text-success-700 border-success-100',
  CLOSED: 'bg-navy-100 text-navy-600 border-navy-200',
};

export const ticketPriorityBadge: Record<TicketPriority, string> = {
  URGENT: 'bg-danger-50 text-danger-700 border-danger-100',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-100',
  MEDIUM: 'bg-warning-50 text-warning-700 border-warning-100',
  LOW: 'bg-navy-100 text-navy-600 border-navy-200',
};

export const documentStatusBadge: Record<DocumentStatus, string> = {
  PROCESSING: 'bg-warning-50 text-warning-700 border-warning-100',
  READY: 'bg-success-50 text-success-700 border-success-100',
  FAILED: 'bg-danger-50 text-danger-700 border-danger-100',
};

export const readinessStatusBadge: Record<ReadinessStatus, string> = {
  READY: 'bg-success-50 text-success-700 border-success-100',
  PARTIALLY_READY: 'bg-warning-50 text-warning-700 border-warning-100',
  NOT_READY: 'bg-danger-50 text-danger-700 border-danger-100',
};

export const readinessStatusLabel: Record<ReadinessStatus, string> = {
  READY: 'Ready',
  PARTIALLY_READY: 'Partially Ready',
  NOT_READY: 'Not Ready',
};

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
