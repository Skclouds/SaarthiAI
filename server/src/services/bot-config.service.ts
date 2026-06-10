import { Types } from 'mongoose';
import {
  BotConfig,
  BotPersonality,
  DEFAULT_SUGGESTED_QUESTIONS,
  EscalationRule,
  IBotConfig,
} from '../models';

export interface BotConfigDto {
  botName: string;
  welcomeMessage: string;
  personality: BotPersonality;
  escalationRules: EscalationRule[];
  suggestedQuestions: string[];
  updatedAt: Date;
}

function toDto(config: IBotConfig): BotConfigDto {
  return {
    botName: config.botName,
    welcomeMessage: config.welcomeMessage,
    personality: config.personality,
    escalationRules: config.escalationRules,
    suggestedQuestions: config.suggestedQuestions,
    updatedAt: config.updatedAt,
  };
}

const DEFAULTS = {
  botName: 'SaarthiAI',
  welcomeMessage: 'Hello! How can I help you today?',
  personality: 'Friendly' as BotPersonality,
  escalationRules: [] as EscalationRule[],
  suggestedQuestions: DEFAULT_SUGGESTED_QUESTIONS,
};

export async function getOrCreateBotConfig(businessId: Types.ObjectId): Promise<BotConfigDto> {
  let config = await BotConfig.findOne({ businessId });

  if (!config) {
    config = await BotConfig.create({
      businessId,
      ...DEFAULTS,
    });
  }

  return toDto(config);
}

export async function updateBotConfig(
  businessId: Types.ObjectId,
  updates: Partial<{
    botName: string;
    welcomeMessage: string;
    personality: BotPersonality;
    escalationRules: EscalationRule[];
    suggestedQuestions: string[];
  }>,
): Promise<BotConfigDto> {
  const config = await BotConfig.findOneAndUpdate(
    { businessId },
    { $set: updates },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );

  return toDto(config!);
}

export async function getPublicBotConfig(businessId: string): Promise<{
  botName: string;
  welcomeMessage: string;
  personality: BotPersonality;
}> {
  const config = await getOrCreateBotConfig(new Types.ObjectId(businessId));
  return {
    botName: config.botName,
    welcomeMessage: config.welcomeMessage,
    personality: config.personality,
  };
}

export async function getSuggestedQuestions(businessId: string): Promise<string[]> {
  const config = await getOrCreateBotConfig(new Types.ObjectId(businessId));
  return config.suggestedQuestions;
}
