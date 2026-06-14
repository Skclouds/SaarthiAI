import { Types } from 'mongoose';
import {
  ChatSourceLog,
  Conversation,
  DocumentModel,
  Message,
  Ticket,
} from '../models';

export interface CsatMetrics {
  csat: number;
  thumbsUp: number;
  thumbsDown: number;
}

export interface OverviewStats extends CsatMetrics {
  totalConversations: number;
  openTickets: number;
  resolvedTickets: number;
  escalatedTickets: number;
  aiResolutionRate: number;
}

export interface AnalyticsTimePoint {
  date: string;
  avgResponseTimeMs: number;
  resolutionRate: number;
  escalationRate: number;
  conversationCount: number;
  csat: number;
  thumbsUp: number;
  thumbsDown: number;
}

export interface ReferencedDocument {
  documentId: string;
  filename: string;
  count: number;
}

export interface UnansweredQuestion {
  conversationId: string;
  customerName: string;
  question: string;
  createdAt: Date;
}

export interface AnalyticsResult extends CsatMetrics {
  avgResponseTimeMs: number;
  resolutionRate: number;
  escalationRate: number;
  timeSeries: AnalyticsTimePoint[];
  kbMetrics: {
    mostReferencedDocuments: ReferencedDocument[];
    failedQueriesCount: number;
    unansweredQuestions: UnansweredQuestion[];
  };
}

export function emptyAnalyticsResult(): AnalyticsResult {
  return {
    avgResponseTimeMs: 0,
    resolutionRate: 0,
    escalationRate: 0,
    thumbsUp: 0,
    thumbsDown: 0,
    csat: 0,
    timeSeries: [],
    kbMetrics: {
      mostReferencedDocuments: [],
      failedQueriesCount: 0,
      unansweredQuestions: [],
    },
  };
}

function parseDateRange(from?: string, to?: string): { start: Date; end: Date } {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const fallbackEnd = new Date();
    const fallbackStart = new Date(fallbackEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
    fallbackStart.setHours(0, 0, 0, 0);
    fallbackEnd.setHours(23, 59, 59, 999);
    return { start: fallbackStart, end: fallbackEnd };
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function computeCsat(thumbsUp: number, thumbsDown: number): number {
  return rate(thumbsUp, thumbsUp + thumbsDown);
}

async function getRatingCounts(
  businessId: Types.ObjectId,
  dateFilter?: { createdAt: { $gte: Date; $lte: Date } },
): Promise<{ thumbsUp: number; thumbsDown: number }> {
  const match: Record<string, unknown> = {
    'conv.businessId': businessId,
    role: 'ASSISTANT',
    rating: { $in: ['UP', 'DOWN'] },
  };
  if (dateFilter) {
    match.createdAt = dateFilter.createdAt;
  }

  const result = await Message.aggregate<{ thumbsUp: number; thumbsDown: number }>([
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversationId',
        foreignField: '_id',
        as: 'conv',
      },
    },
    { $unwind: '$conv' },
    { $match: match },
    {
      $group: {
        _id: null,
        thumbsUp: { $sum: { $cond: [{ $eq: ['$rating', 'UP'] }, 1, 0] } },
        thumbsDown: { $sum: { $cond: [{ $eq: ['$rating', 'DOWN'] }, 1, 0] } },
      },
    },
  ]);

  return {
    thumbsUp: result[0]?.thumbsUp ?? 0,
    thumbsDown: result[0]?.thumbsDown ?? 0,
  };
}

async function getRatingCountsByDate(
  businessId: Types.ObjectId,
  dateFilter: { createdAt: { $gte: Date; $lte: Date } },
): Promise<Map<string, { thumbsUp: number; thumbsDown: number }>> {
  const rows = await Message.aggregate<{
    _id: string;
    thumbsUp: number;
    thumbsDown: number;
  }>([
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversationId',
        foreignField: '_id',
        as: 'conv',
      },
    },
    { $unwind: '$conv' },
    {
      $match: {
        'conv.businessId': businessId,
        role: 'ASSISTANT',
        rating: { $in: ['UP', 'DOWN'] },
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        thumbsUp: { $sum: { $cond: [{ $eq: ['$rating', 'UP'] }, 1, 0] } },
        thumbsDown: { $sum: { $cond: [{ $eq: ['$rating', 'DOWN'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return new Map(rows.map((r) => [r._id, { thumbsUp: r.thumbsUp, thumbsDown: r.thumbsDown }]));
}

export async function getOverviewStats(businessId: Types.ObjectId): Promise<OverviewStats> {
  const [
    totalConversations,
    openTickets,
    resolvedTickets,
    escalatedConversations,
    nonEscalatedConversations,
    ratings,
  ] = await Promise.all([
    Conversation.countDocuments({ businessId }),
    Ticket.countDocuments({ businessId, status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
    Ticket.countDocuments({ businessId, status: { $in: ['RESOLVED', 'CLOSED'] } }),
    Conversation.countDocuments({ businessId, escalated: true }),
    Conversation.countDocuments({ businessId, escalated: false }),
    getRatingCounts(businessId),
  ]);

  const aiResolutionRate = rate(nonEscalatedConversations, totalConversations);
  const csat = computeCsat(ratings.thumbsUp, ratings.thumbsDown);

  console.log('[Stats] overview:', {
    businessId: businessId.toString(),
    totalConversations,
    nonEscalatedConversations,
    escalatedConversations,
    aiResolutionRate: {
      formula: 'nonEscalatedConversations / totalConversations * 100',
      numerator: nonEscalatedConversations,
      denominator: totalConversations,
      result: aiResolutionRate,
    },
    csat: {
      formula: 'thumbsUp / (thumbsUp + thumbsDown) * 100',
      thumbsUp: ratings.thumbsUp,
      thumbsDown: ratings.thumbsDown,
      result: csat,
    },
  });

  return {
    totalConversations,
    openTickets,
    resolvedTickets,
    escalatedTickets: escalatedConversations,
    aiResolutionRate,
    thumbsUp: ratings.thumbsUp,
    thumbsDown: ratings.thumbsDown,
    csat,
  };
}

export async function getAnalytics(
  businessId: Types.ObjectId,
  from?: string,
  to?: string,
): Promise<AnalyticsResult> {
  const { start, end } = parseDateRange(from, to);

  const convFilter = { businessId, createdAt: { $gte: start, $lte: end } };
  const msgDateFilter = { createdAt: { $gte: start, $lte: end } };

  const [
    conversationsInRange,
    escalatedInRange,
    avgResponseResult,
    timeSeriesConv,
    timeSeriesResponse,
    sourceCounts,
    failedQueriesCount,
    unansweredAssistants,
    ratings,
    ratingsByDate,
  ] = await Promise.all([
    Conversation.countDocuments(convFilter),
    Conversation.countDocuments({ ...convFilter, escalated: true }),
    Message.aggregate<{ avg: number }>([
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conv',
        },
      },
      { $unwind: '$conv' },
      {
        $match: {
          'conv.businessId': businessId,
          role: 'ASSISTANT',
          responseTimeMs: { $exists: true, $ne: null },
          ...msgDateFilter,
        },
      },
      { $group: { _id: null, avg: { $avg: '$responseTimeMs' } } },
    ]),
    Conversation.aggregate<{ _id: string; total: number; escalated: number }>([
      { $match: convFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          escalated: { $sum: { $cond: ['$escalated', 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Message.aggregate<{ _id: string; avg: number }>([
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conv',
        },
      },
      { $unwind: '$conv' },
      {
        $match: {
          'conv.businessId': businessId,
          role: 'ASSISTANT',
          responseTimeMs: { $exists: true },
          ...msgDateFilter,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avg: { $avg: '$responseTimeMs' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    ChatSourceLog.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { businessId, ...msgDateFilter } },
      { $group: { _id: '$documentId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Message.aggregate<{ count: number }>([
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conv',
        },
      },
      { $unwind: '$conv' },
      {
        $match: {
          'conv.businessId': businessId,
          role: 'ASSISTANT',
          unanswered: true,
          ...msgDateFilter,
        },
      },
      { $count: 'count' },
    ]),
    Message.find({
      role: 'ASSISTANT',
      unanswered: true,
      ...msgDateFilter,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    getRatingCounts(businessId, msgDateFilter),
    getRatingCountsByDate(businessId, msgDateFilter),
  ]);

  const responseByDate = new Map(timeSeriesResponse.map((r) => [r._id, r.avg]));

  const timeSeries: AnalyticsTimePoint[] = timeSeriesConv.map((day) => {
    const resolved = day.total - day.escalated;
    const dayRatings = ratingsByDate.get(day._id) ?? { thumbsUp: 0, thumbsDown: 0 };
    return {
      date: day._id,
      avgResponseTimeMs: Math.round(responseByDate.get(day._id) ?? 0),
      resolutionRate: rate(resolved, day.total),
      escalationRate: rate(day.escalated, day.total),
      conversationCount: day.total,
      thumbsUp: dayRatings.thumbsUp,
      thumbsDown: dayRatings.thumbsDown,
      csat: computeCsat(dayRatings.thumbsUp, dayRatings.thumbsDown),
    };
  });

  const resolvedInRange = conversationsInRange - escalatedInRange;
  const avgResponseTimeMs = Math.round(avgResponseResult[0]?.avg ?? 0);
  const resolutionRate = rate(resolvedInRange, conversationsInRange);
  const escalationRate = rate(escalatedInRange, conversationsInRange);
  const csat = computeCsat(ratings.thumbsUp, ratings.thumbsDown);

  console.log('[Stats] analytics:', {
    businessId: businessId.toString(),
    range: { from: start.toISOString(), to: end.toISOString() },
    conversationsInRange,
    escalatedInRange,
    resolvedInRange,
    avgResponseTimeMs: {
      formula: 'avg(assistantMessage.responseTimeMs) in range',
      messageCount: avgResponseResult[0] ? 'aggregated' : 0,
      result: avgResponseTimeMs,
    },
    resolutionRate: {
      formula: '(conversationsInRange - escalatedInRange) / conversationsInRange * 100',
      numerator: resolvedInRange,
      denominator: conversationsInRange,
      result: resolutionRate,
    },
    escalationRate: {
      formula: 'escalatedInRange / conversationsInRange * 100',
      numerator: escalatedInRange,
      denominator: conversationsInRange,
      result: escalationRate,
    },
    csat: {
      formula: 'thumbsUp / (thumbsUp + thumbsDown) * 100',
      thumbsUp: ratings.thumbsUp,
      thumbsDown: ratings.thumbsDown,
      result: csat,
    },
  });

  const docIds = sourceCounts.map((s) => s._id);
  const docs = await DocumentModel.find({ _id: { $in: docIds }, businessId }).lean();
  const filenameMap = new Map(docs.map((d) => [d._id.toString(), d.filename]));

  const mostReferencedDocuments: ReferencedDocument[] = sourceCounts.map((s) => ({
    documentId: s._id.toString(),
    filename: filenameMap.get(s._id.toString()) ?? 'Unknown document',
    count: s.count,
  }));

  const unansweredQuestions: UnansweredQuestion[] = [];
  for (const assistant of unansweredAssistants) {
    const conv = await Conversation.findById(assistant.conversationId).lean();
    if (!conv || !conv.businessId.equals(businessId)) continue;

    const userMsg = await Message.findOne({
      conversationId: assistant.conversationId,
      role: 'USER',
      createdAt: { $lt: assistant.createdAt },
    })
      .sort({ createdAt: -1 })
      .lean();

    unansweredQuestions.push({
      conversationId: assistant.conversationId.toString(),
      customerName: conv.customerName,
      question: userMsg?.content ?? '(unknown)',
      createdAt: assistant.createdAt,
    });
  }

  return {
    avgResponseTimeMs,
    resolutionRate,
    escalationRate,
    thumbsUp: ratings.thumbsUp,
    thumbsDown: ratings.thumbsDown,
    csat,
    timeSeries,
    kbMetrics: {
      mostReferencedDocuments,
      failedQueriesCount: failedQueriesCount[0]?.count ?? 0,
      unansweredQuestions,
    },
  };
}
