import { Types } from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import { Conversation, Ticket, TicketPriority, TicketStatus } from '../models';
import * as notificationService from './notification.service';

export interface TicketDto {
  id: string;
  conversationId: string;
  customerName: string;
  email: string;
  query: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
}

export interface EscalationSummary {
  URGENT: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

function toDto(ticket: {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  customerName: string;
  email: string;
  query: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
}): TicketDto {
  return {
    id: ticket._id.toString(),
    conversationId: ticket.conversationId.toString(),
    customerName: ticket.customerName,
    email: ticket.email,
    query: ticket.query,
    priority: ticket.priority,
    status: ticket.status,
    createdAt: ticket.createdAt,
  };
}

export async function listTickets(
  businessId: Types.ObjectId,
  filters: { status?: TicketStatus; priority?: TicketPriority },
): Promise<TicketDto[]> {
  const query: Record<string, unknown> = { businessId };

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;

  const tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
  return tickets.map((t) => toDto(t as Parameters<typeof toDto>[0]));
}

export async function getTicket(
  ticketId: string,
  businessId: Types.ObjectId,
): Promise<TicketDto> {
  const ticket = await Ticket.findOne({
    _id: new Types.ObjectId(ticketId),
    businessId,
  }).lean();

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  return toDto(ticket as Parameters<typeof toDto>[0]);
}

export async function updateTicketStatus(
  ticketId: string,
  businessId: Types.ObjectId,
  status: TicketStatus,
): Promise<TicketDto> {
  const ticket = await Ticket.findOneAndUpdate(
    { _id: new Types.ObjectId(ticketId), businessId },
    { status },
    { new: true },
  );

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  return toDto(ticket);
}

export async function createTicket(
  businessId: Types.ObjectId,
  data: {
    customerName: string;
    email: string;
    query: string;
    priority: TicketPriority;
    conversationId?: string;
  },
): Promise<TicketDto> {
  let conversationId: Types.ObjectId;

  if (data.conversationId) {
    const existing = await Conversation.findOne({
      _id: new Types.ObjectId(data.conversationId),
      businessId,
    });
    if (!existing) {
      throw new AppError('Conversation not found', 404);
    }
    conversationId = existing._id;
    await Conversation.findByIdAndUpdate(conversationId, { escalated: true });
  } else {
    const conversation = await Conversation.create({
      businessId,
      customerName: data.customerName,
      customerEmail: data.email,
      escalated: true,
    });
    conversationId = conversation._id;
  }

  const ticket = await Ticket.create({
    businessId,
    conversationId,
    customerName: data.customerName,
    email: data.email,
    query: data.query,
    priority: data.priority,
    status: 'OPEN',
  });

  await notificationService.notifyNewTicket(
    businessId,
    ticket._id,
    data.customerName,
    data.priority,
  );

  return toDto(ticket);
}

export async function getEscalationSummary(businessId: Types.ObjectId): Promise<EscalationSummary> {
  const counts = await Ticket.aggregate([
    {
      $match: {
        businessId,
        status: { $in: ['OPEN', 'IN_PROGRESS'] },
      },
    },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  const summary: EscalationSummary = { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const row of counts) {
    const key = row._id as keyof EscalationSummary;
    if (key in summary) summary[key] = row.count;
  }

  return summary;
}

export async function listEscalatedTickets(
  businessId: Types.ObjectId,
): Promise<Record<TicketPriority, TicketDto[]>> {
  const tickets = await Ticket.find({
    businessId,
    status: { $in: ['OPEN', 'IN_PROGRESS'] },
  })
    .sort({ createdAt: -1 })
    .lean();

  const grouped: Record<TicketPriority, TicketDto[]> = {
    URGENT: [],
    HIGH: [],
    MEDIUM: [],
    LOW: [],
  };

  for (const t of tickets) {
    grouped[t.priority as TicketPriority].push(toDto(t as Parameters<typeof toDto>[0]));
  }

  return grouped;
}
