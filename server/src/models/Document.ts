import mongoose, { Document, Schema, Types } from 'mongoose';

export type DocumentStatus = 'PROCESSING' | 'READY' | 'FAILED';

export interface IDocument extends Document {
  businessId: Types.ObjectId;
  filename: string;
  fileType: string;
  status: DocumentStatus;
  createdAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    filename: { type: String, required: true },
    fileType: { type: String, required: true },
    status: {
      type: String,
      enum: ['PROCESSING', 'READY', 'FAILED'],
      default: 'PROCESSING',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
