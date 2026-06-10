export type BotPersonality = 'Professional' | 'Friendly' | 'Technical';
export type EscalationPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface EscalationRule {
  trigger: string;
  priority: EscalationPriority;
}

export interface BotConfig {
  botName: string;
  welcomeMessage: string;
  personality: BotPersonality;
  escalationRules: EscalationRule[];
  suggestedQuestions: string[];
  updatedAt: string;
}
