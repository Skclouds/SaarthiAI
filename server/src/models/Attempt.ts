import mongoose, { Document, Schema, Types } from 'mongoose';

export type ReadinessStatus = 'READY' | 'PARTIALLY_READY' | 'NOT_READY';

export interface IAttemptAnswer {
  qid: string;
  selectedIndex: number;
}

export interface IPerTopic {
  topic: string;
  correct: number;
  total: number;
}

export interface IAttempt extends Document {
  businessId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  learnerName: string;
  learnerEmail: string;
  answers: IAttemptAnswer[];
  scorePercent: number;
  perTopic: IPerTopic[];
  readinessStatus: ReadinessStatus;
  gaps: string[];
  createdAt: Date;
}

const attemptAnswerSchema = new Schema<IAttemptAnswer>(
  {
    qid: { type: String, required: true },
    selectedIndex: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: false },
);

const perTopicSchema = new Schema<IPerTopic>(
  {
    topic: { type: String, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

const attemptSchema = new Schema<IAttempt>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
    learnerName: { type: String, required: true },
    learnerEmail: { type: String, required: true },
    answers: { type: [attemptAnswerSchema], required: true },
    scorePercent: { type: Number, required: true },
    perTopic: { type: [perTopicSchema], required: true },
    readinessStatus: {
      type: String,
      enum: ['READY', 'PARTIALLY_READY', 'NOT_READY'],
      required: true,
    },
    gaps: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

attemptSchema.index({ businessId: 1, createdAt: -1 });
attemptSchema.index({ assessmentId: 1, createdAt: -1 });

export const Attempt = mongoose.model<IAttempt>('Attempt', attemptSchema);
