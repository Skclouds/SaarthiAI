import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConversation extends Document {
  businessId: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  escalated: boolean;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    escalated: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
