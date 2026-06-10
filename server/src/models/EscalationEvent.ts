import mongoose, { Document, Schema, Types } from 'mongoose';
import { TicketPriority } from './Ticket';

export interface IEscalationEvent extends Document {
  businessId: Types.ObjectId;
  conversationId: Types.ObjectId;
  ticketId: Types.ObjectId;
  matchedTriggers: string[];
  priority: TicketPriority;
  userMessage: string;
  createdAt: Date;
}

const escalationEventSchema = new Schema<IEscalationEvent>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    matchedTriggers: { type: [String], required: true },
    priority: {
      type: String,
      enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
      required: true,
    },
    userMessage: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const EscalationEvent = mongoose.model<IEscalationEvent>(
  'EscalationEvent',
  escalationEventSchema,
);
