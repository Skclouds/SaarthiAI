import { TicketPriority, TicketStatus } from './ticket';

export interface LinkedTicketSummary {
  id: string;
  priority: TicketPriority;
  status: TicketStatus;
}

export interface ConversationListItem {
  id: string;
  customerName: string;
  customerEmail: string;
  messageCount: number;
  escalated: boolean;
  linkedTicket: LinkedTicketSummary | null;
  lastActivity: string;
  createdAt: string;
}

export interface ConversationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type TimelineItem =
  | {
      type: 'message';
      id: string;
      role: 'USER' | 'ASSISTANT';
      content: string;
      responseTimeMs?: number;
      unanswered?: boolean;
      createdAt: string;
    }
  | {
      type: 'escalation';
      id: string;
      matchedTriggers: string[];
      priority: TicketPriority;
      userMessage: string;
      ticketId: string;
      createdAt: string;
    }
  | {
      type: 'ticket_created';
      id: string;
      priority: TicketPriority;
      status: TicketStatus;
      query: string;
      createdAt: string;
    };

export interface ConversationDetail {
  id: string;
  customerName: string;
  customerEmail: string;
  escalated: boolean;
  createdAt: string;
  timeline: TimelineItem[];
}
