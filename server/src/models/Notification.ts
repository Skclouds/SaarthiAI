import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType = 'NEW_CONVERSATION' | 'NEW_TICKET' | 'ESCALATION';

export interface INotification extends Document {
  businessId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: {
      type: String,
      enum: ['NEW_CONVERSATION', 'NEW_TICKET', 'ESCALATION'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ businessId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
