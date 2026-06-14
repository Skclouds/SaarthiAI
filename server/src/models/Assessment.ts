import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAssessmentQuestion {
  qid: string;
  text: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

export interface IAssessment extends Document {
  businessId: Types.ObjectId;
  documentId: Types.ObjectId;
  title: string;
  questions: IAssessmentQuestion[];
  createdAt: Date;
}

const assessmentQuestionSchema = new Schema<IAssessmentQuestion>(
  {
    qid: { type: String, required: true },
    text: { type: String, required: true },
    options: { type: [String], required: true, validate: [(v: string[]) => v.length === 4, 'Must have 4 options'] },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    topic: { type: String, required: true },
  },
  { _id: false },
);

const assessmentSchema = new Schema<IAssessment>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    title: { type: String, required: true },
    questions: { type: [assessmentQuestionSchema], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

assessmentSchema.index({ businessId: 1, createdAt: -1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);
