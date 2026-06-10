import api from './api';
import { EscalationSummary, Ticket, TicketPriority, TicketStatus, TicketsByPriority } from '@/types/ticket';

export async function fetchTickets(filters?: {
  status?: TicketStatus;
  priority?: TicketPriority;
}): Promise<Ticket[]> {
  const { data } = await api.get<{ tickets: Ticket[] }>('/tickets', { params: filters });
  return data.tickets;
}

export async function fetchTicket(id: string): Promise<Ticket> {
  const { data } = await api.get<{ ticket: Ticket }>(`/tickets/${id}`);
  return data.ticket;
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  const { data } = await api.patch<{ ticket: Ticket }>(`/tickets/${id}`, { status });
  return data.ticket;
}

export async function createTicket(payload: {
  customerName: string;
  email: string;
  query: string;
  priority: TicketPriority;
  conversationId?: string;
}): Promise<Ticket> {
  const { data } = await api.post<{ ticket: Ticket }>('/tickets', payload);
  return data.ticket;
}

export async function fetchEscalationSummary(): Promise<EscalationSummary> {
  const { data } = await api.get<{ summary: EscalationSummary }>('/escalations/summary');
  return data.summary;
}

export async function fetchEscalatedTickets(): Promise<TicketsByPriority> {
  const { data } = await api.get<{ tickets: TicketsByPriority }>('/escalations/tickets');
  return data.tickets;
}
