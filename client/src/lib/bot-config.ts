import api from './api';
import { BotConfig } from '@/types/bot-config';

export async function fetchBotConfig(): Promise<BotConfig> {
  const { data } = await api.get<{ config: BotConfig }>('/bot-config');
  return data.config;
}

export async function updateBotConfig(config: Omit<BotConfig, 'updatedAt'>): Promise<BotConfig> {
  const { data } = await api.put<{ config: BotConfig }>('/bot-config', config);
  return data.config;
}
