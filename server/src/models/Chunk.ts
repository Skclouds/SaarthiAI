import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChunk extends Document {
  businessId: Types.ObjectId;
  documentId: Types.ObjectId;
  content: string;
  pineconeId: string;
  createdAt: Date;
}

const chunkSchema = new Schema<IChunk>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    content: { type: String, required: true },
    pineconeId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Chunk = mongoose.model<IChunk>('Chunk', chunkSchema);
