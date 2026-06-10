import mongoose, { Document, Schema, Types } from 'mongoose';

export type MessageRole = 'USER' | 'ASSISTANT';
export type MessageRating = 'UP' | 'DOWN';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  role: MessageRole;
  content: string;
  responseTimeMs?: number;
  unanswered?: boolean;
  rating?: MessageRating | null;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    role: { type: String, enum: ['USER', 'ASSISTANT'], required: true },
    content: { type: String, required: true },
    responseTimeMs: { type: Number },
    unanswered: { type: Boolean, default: false },
    rating: { type: String, enum: ['UP', 'DOWN'], default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
