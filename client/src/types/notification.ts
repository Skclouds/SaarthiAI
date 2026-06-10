export type NotificationType = 'NEW_CONVERSATION' | 'NEW_TICKET' | 'ESCALATION';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResult {
  notifications: Notification[];
  unreadCount: number;
}
