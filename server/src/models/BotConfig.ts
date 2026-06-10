import mongoose, { Document, Schema, Types } from 'mongoose';

export type BotPersonality = 'Professional' | 'Friendly' | 'Technical';
export type EscalationPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EscalationRule {
  trigger: string;
  priority: EscalationPriority;
}

export const DEFAULT_SUGGESTED_QUESTIONS = [
  'Track my order',
  'Pricing',
  'Refund policy',
  'Contact support',
];

export interface IBotConfig extends Document {
  businessId: Types.ObjectId;
  botName: string;
  welcomeMessage: string;
  personality: BotPersonality;
  escalationRules: EscalationRule[];
  suggestedQuestions: string[];
  updatedAt: Date;
}

const escalationRuleSchema = new Schema<EscalationRule>(
  {
    trigger: { type: String, required: true },
    priority: {
      type: String,
      enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
      required: true,
    },
  },
  { _id: false },
);

const botConfigSchema = new Schema<IBotConfig>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    botName: { type: String, default: 'SaarthiAI' },
    welcomeMessage: { type: String, default: 'Hello! How can I help you today?' },
    personality: {
      type: String,
      enum: ['Professional', 'Friendly', 'Technical'],
      default: 'Friendly',
    },
    escalationRules: { type: [escalationRuleSchema], default: [] },
    suggestedQuestions: { type: [String], default: DEFAULT_SUGGESTED_QUESTIONS },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export const BotConfig = mongoose.model<IBotConfig>('BotConfig', botConfigSchema);
