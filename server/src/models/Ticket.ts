import mongoose, { Document, Schema, Types } from 'mongoose';

export type TicketPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ITicket extends Document {
  businessId: Types.ObjectId;
  conversationId: Types.ObjectId;
  customerName: string;
  email: string;
  query: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    query: { type: String, required: true },
    priority: {
      type: String,
      enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
