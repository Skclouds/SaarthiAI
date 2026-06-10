import api from './api';
import { Notification, NotificationsResult } from '@/types/notification';

export async function fetchNotifications(): Promise<NotificationsResult> {
  const { data } = await api.get<NotificationsResult>('/notifications');
  return data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await api.patch<{ notification: Notification }>(`/notifications/${id}/read`);
  return data.notification;
}

export async function markAllNotificationsRead(): Promise<{ updatedCount: number }> {
  const { data } = await api.patch<{ updatedCount: number }>('/notifications/read-all');
  return data;
}
