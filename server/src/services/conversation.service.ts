import { Types } from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import {
  Conversation,
  EscalationEvent,
  Message,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../models';

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
  lastActivity: Date;
  createdAt: Date;
}

export interface PaginatedConversations {
  conversations: ConversationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type TimelineItem =
  | {
      type: 'message';
      id: string;
      role: 'USER' | 'ASSISTANT';
      content: string;
      responseTimeMs?: number;
      unanswered?: boolean;
      createdAt: Date;
    }
  | {
      type: 'escalation';
      id: string;
      matchedTriggers: string[];
      priority: TicketPriority;
      userMessage: string;
      ticketId: string;
      createdAt: Date;
    }
  | {
      type: 'ticket_created';
      id: string;
      priority: TicketPriority;
      status: TicketStatus;
      query: string;
      createdAt: Date;
    };

export interface ConversationDetail {
  id: string;
  customerName: string;
  customerEmail: string;
  escalated: boolean;
  createdAt: Date;
  timeline: TimelineItem[];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pickLinkedTicket(
  tickets: Array<{
    _id: Types.ObjectId;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: Date;
  }>,
): LinkedTicketSummary | null {
  if (tickets.length === 0) return null;

  const open = tickets.find((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const ticket = open ?? tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  return {
    id: ticket._id.toString(),
    priority: ticket.priority,
    status: ticket.status,
  };
}

async function enrichListItems(
  conversations: Array<{
    _id: Types.ObjectId;
    customerName: string;
    customerEmail: string;
    escalated: boolean;
    createdAt: Date;
  }>,
): Promise<ConversationListItem[]> {
  if (conversations.length === 0) return [];

  const ids = conversations.map((c) => c._id);

  const [messageStats, tickets] = await Promise.all([
    Message.aggregate<{ _id: Types.ObjectId; count: number; lastActivity: Date }>([
      { $match: { conversationId: { $in: ids } } },
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
        },
      },
    ]),
    Ticket.find({ conversationId: { $in: ids } }).lean(),
  ]);

  const statsMap = new Map(messageStats.map((s) => [s._id.toString(), s]));
  const ticketsByConv = new Map<string, typeof tickets>();
  for (const t of tickets) {
    const key = t.conversationId.toString();
    const list = ticketsByConv.get(key) ?? [];
    list.push(t);
    ticketsByConv.set(key, list);
  }

  return conversations.map((conv) => {
    const stats = statsMap.get(conv._id.toString());
    const convTickets = ticketsByConv.get(conv._id.toString()) ?? [];
    const lastActivity = stats?.lastActivity ?? conv.createdAt;

    return {
      id: conv._id.toString(),
      customerName: conv.customerName,
      customerEmail: conv.customerEmail,
      messageCount: stats?.count ?? 0,
      escalated: conv.escalated,
      linkedTicket: pickLinkedTicket(convTickets),
      lastActivity,
      createdAt: conv.createdAt,
    };
  });
}

export async function listConversations(
  businessId: Types.ObjectId,
  page: number,
  limit: number,
): Promise<PaginatedConversations> {
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    Conversation.find({ businessId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Conversation.countDocuments({ businessId }),
  ]);

  const items = await enrichListItems(conversations);

  // Re-sort by lastActivity descending
  items.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

  return {
    conversations: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getConversationDetail(
  conversationId: string,
  businessId: Types.ObjectId,
): Promise<ConversationDetail> {
  const conversation = await Conversation.findOne({
    _id: new Types.ObjectId(conversationId),
    businessId,
  }).lean();

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const convOid = conversation._id;

  const [messages, escalationEvents, tickets] = await Promise.all([
    Message.find({ conversationId: convOid }).sort({ createdAt: 1 }).lean(),
    EscalationEvent.find({ conversationId: convOid }).sort({ createdAt: 1 }).lean(),
    Ticket.find({ conversationId: convOid }).sort({ createdAt: 1 }).lean(),
  ]);

  const timeline: TimelineItem[] = [
    ...messages.map((m) => ({
      type: 'message' as const,
      id: m._id.toString(),
      role: m.role,
      content: m.content,
      responseTimeMs: m.responseTimeMs,
      unanswered: m.unanswered,
      createdAt: m.createdAt,
    })),
    ...escalationEvents.map((e) => ({
      type: 'escalation' as const,
      id: e._id.toString(),
      matchedTriggers: e.matchedTriggers,
      priority: e.priority,
      userMessage: e.userMessage,
      ticketId: e.ticketId.toString(),
      createdAt: e.createdAt,
    })),
    ...tickets.map((t) => ({
      type: 'ticket_created' as const,
      id: t._id.toString(),
      priority: t.priority,
      status: t.status,
      query: t.query,
      createdAt: t.createdAt,
    })),
  ];

  timeline.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return {
    id: conversation._id.toString(),
    customerName: conversation.customerName,
    customerEmail: conversation.customerEmail,
    escalated: conversation.escalated,
    createdAt: conversation.createdAt,
    timeline,
  };
}

export async function searchConversations(
  businessId: Types.ObjectId,
  query: string,
  page: number,
  limit: number,
): Promise<PaginatedConversations> {
  const trimmed = query.trim();
  if (!trimmed) {
    return listConversations(businessId, page, limit);
  }

  const matchingIds = await Message.aggregate<{ _id: Types.ObjectId }>([
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversationId',
        foreignField: '_id',
        as: 'conversation',
      },
    },
    { $unwind: '$conversation' },
    {
      $match: {
        'conversation.businessId': businessId,
        content: { $regex: escapeRegex(trimmed), $options: 'i' },
      },
    },
    { $group: { _id: '$conversationId' } },
    { $sort: { _id: -1 } },
  ]);

  const allIds = matchingIds.map((r) => r._id);
  const total = allIds.length;
  const skip = (page - 1) * limit;
  const pageIds = allIds.slice(skip, skip + limit);

  if (pageIds.length === 0) {
    return {
      conversations: [],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  const conversations = await Conversation.find({ _id: { $in: pageIds } }).lean();
  const items = await enrichListItems(conversations);
  items.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

  return {
    conversations: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
