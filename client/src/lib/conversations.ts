import api from './api';
import {
  ConversationDetail,
  ConversationListItem,
  ConversationPagination,
} from '@/types/conversation';

interface ConversationsResponse {
  conversations: ConversationListItem[];
  pagination: ConversationPagination;
}

export async function fetchConversations(
  page = 1,
  limit = 20,
): Promise<ConversationsResponse> {
  const { data } = await api.get<ConversationsResponse>('/conversations', {
    params: { page, limit },
  });
  return data;
}

export async function searchConversations(
  q: string,
  page = 1,
  limit = 20,
): Promise<ConversationsResponse> {
  const { data } = await api.get<ConversationsResponse>('/conversations/search', {
    params: { q, page, limit },
  });
  return data;
}

export async function fetchConversationDetail(id: string): Promise<ConversationDetail> {
  const { data } = await api.get<{ conversation: ConversationDetail }>(
    `/conversations/${id}`,
  );
  return data.conversation;
}
