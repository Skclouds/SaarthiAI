import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChatSourceLog extends Document {
  businessId: Types.ObjectId;
  conversationId: Types.ObjectId;
  messageId: Types.ObjectId;
  documentId: Types.ObjectId;
  createdAt: Date;
}

const chatSourceLogSchema = new Schema<IChatSourceLog>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ChatSourceLog = mongoose.model<IChatSourceLog>('ChatSourceLog', chatSourceLogSchema);
