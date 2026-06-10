import { Types } from 'mongoose';
import { Conversation, EscalationEvent, EscalationRule, Ticket, TicketPriority } from '../models';
import * as notificationService from './notification.service';

const PRIORITY_RANK: Record<TicketPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

interface BuiltinTrigger {
  pattern: RegExp;
  priority: TicketPriority;
  label: string;
}

const BUILTIN_TRIGGERS: BuiltinTrigger[] = [
  { pattern: /service outage|system down|downtime|outage/i, priority: 'URGENT', label: 'service outage' },
  { pattern: /legal|lawsuit|attorney|lawyer|court/i, priority: 'URGENT', label: 'legal' },
  { pattern: /refund|payment failure|payment failed|chargeback|failed payment/i, priority: 'HIGH', label: 'refund/payment failure' },
  { pattern: /angry|frustrated|furious|terrible service|unacceptable|ridiculous/i, priority: 'HIGH', label: 'angry/frustrated' },
  {
    pattern: /talk to a human|speak to (a )?human|real (person|agent)|human agent|connect me with/i,
    priority: 'MEDIUM',
    label: 'talk to a human',
  },
];

export interface EscalationDetection {
  triggered: boolean;
  priority?: TicketPriority;
  matchedTriggers: string[];
}

export function detectEscalation(
  message: string,
  customRules: EscalationRule[],
): EscalationDetection {
  const normalized = message.toLowerCase();
  const matches: { priority: TicketPriority; label: string }[] = [];

  for (const rule of customRules) {
    if (rule.trigger && normalized.includes(rule.trigger.toLowerCase())) {
      matches.push({ priority: rule.priority, label: `custom: ${rule.trigger}` });
    }
  }

  for (const builtin of BUILTIN_TRIGGERS) {
    if (builtin.pattern.test(message)) {
      matches.push({ priority: builtin.priority, label: builtin.label });
    }
  }

  if (matches.length === 0) {
    return { triggered: false, matchedTriggers: [] };
  }

  const best = matches.reduce((a, b) =>
    PRIORITY_RANK[b.priority] > PRIORITY_RANK[a.priority] ? b : a,
  );

  return {
    triggered: true,
    priority: best.priority,
    matchedTriggers: matches.map((m) => m.label),
  };
}

export async function processEscalation(
  businessId: Types.ObjectId,
  conversationId: Types.ObjectId,
  customerName: string,
  customerEmail: string,
  userMessage: string,
  customRules: EscalationRule[],
): Promise<{ escalated: boolean; ticketId?: string }> {
  const detection = detectEscalation(userMessage, customRules);

  if (!detection.triggered || !detection.priority) {
    return { escalated: false };
  }

  await Conversation.findByIdAndUpdate(conversationId, { escalated: true });

  let ticket = await Ticket.findOne({
    businessId,
    conversationId,
    status: { $in: ['OPEN', 'IN_PROGRESS'] },
  });

  let isNewTicket = false;

  if (ticket) {
    if (PRIORITY_RANK[detection.priority] > PRIORITY_RANK[ticket.priority]) {
      ticket.priority = detection.priority;
      ticket.query = userMessage;
      await ticket.save();
    }
  } else {
    ticket = await Ticket.create({
      businessId,
      conversationId,
      customerName,
      email: customerEmail,
      query: userMessage,
      priority: detection.priority,
      status: 'OPEN',
    });
    isNewTicket = true;
  }

  await EscalationEvent.create({
    businessId,
    conversationId,
    ticketId: ticket._id,
    matchedTriggers: detection.matchedTriggers,
    priority: detection.priority,
    userMessage,
  });

  await notificationService.notifyEscalation(
    businessId,
    ticket._id,
    customerName,
    detection.matchedTriggers,
  );

  if (isNewTicket) {
    await notificationService.notifyNewTicket(
      businessId,
      ticket._id,
      customerName,
      detection.priority,
    );
  }

  return { escalated: true, ticketId: ticket._id.toString() };
}
