export type TicketPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Ticket {
  id: string;
  conversationId: string;
  customerName: string;
  email: string;
  query: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
}

export interface EscalationSummary {
  URGENT: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

export type TicketsByPriority = Record<TicketPriority, Ticket[]>;
