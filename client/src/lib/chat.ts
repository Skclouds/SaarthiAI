import publicApi from './public-api';
import { ChatResponse, PublicBotConfig } from '@/types/chat';

export async function fetchSuggestedQuestions(businessId: string): Promise<string[]> {
  const { data } = await publicApi.get<{ questions: string[] }>('/chat/suggested-questions', {
    params: { businessId },
  });
  return data.questions;
}

export async function fetchPublicBotConfig(businessId: string): Promise<PublicBotConfig> {
  const { data } = await publicApi.get<{ config: PublicBotConfig }>('/chat/config', {
    params: { businessId },
  });
  return data.config;
}

export async function submitChatFeedback(
  messageId: string,
  rating: 'UP' | 'DOWN',
  businessId: string,
): Promise<{ messageId: string; rating: 'UP' | 'DOWN' }> {
  const { data } = await publicApi.post<{ messageId: string; rating: 'UP' | 'DOWN' }>(
    '/chat/feedback',
    { messageId, rating, businessId },
  );
  return data;
}

export async function sendChatMessage(payload: {
  businessId: string;
  conversationId?: string;
  customerName: string;
  customerEmail: string;
  message: string;
}): Promise<ChatResponse> {
  const { data } = await publicApi.post<ChatResponse>('/chat', payload);
  return data;
}
