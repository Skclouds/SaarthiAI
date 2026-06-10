import { Types } from 'mongoose';
import { AppError } from '../middleware/errorHandler';
import { Notification, NotificationType } from '../models';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationsResult {
  notifications: NotificationDto[];
  unreadCount: number;
}

const RECENT_LIMIT = 30;

function toDto(doc: {
  _id: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}): NotificationDto {
  return {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    message: doc.message,
    link: doc.link,
    read: doc.read,
    createdAt: doc.createdAt,
  };
}

export async function createNotification(params: {
  businessId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
}): Promise<void> {
  await Notification.create({
    businessId: params.businessId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    read: false,
  });
}

export async function listNotifications(
  businessId: Types.ObjectId,
): Promise<NotificationsResult> {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .lean(),
    Notification.countDocuments({ businessId, read: false }),
  ]);

  return {
    notifications: notifications.map((n) => toDto(n as Parameters<typeof toDto>[0])),
    unreadCount,
  };
}

export async function markNotificationRead(
  notificationId: string,
  businessId: Types.ObjectId,
): Promise<NotificationDto> {
  if (!Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid notification id', 400);
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: new Types.ObjectId(notificationId), businessId },
    { read: true },
    { new: true },
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return toDto(notification);
}

export async function markAllNotificationsRead(
  businessId: Types.ObjectId,
): Promise<{ updatedCount: number }> {
  const result = await Notification.updateMany(
    { businessId, read: false },
    { read: true },
  );

  return { updatedCount: result.modifiedCount };
}

export async function notifyNewConversation(
  businessId: Types.ObjectId,
  conversationId: Types.ObjectId,
  customerName: string,
): Promise<void> {
  await createNotification({
    businessId,
    type: 'NEW_CONVERSATION',
    title: 'New conversation',
    message: `${customerName} started a new chat`,
    link: `/dashboard/conversations?id=${conversationId.toString()}`,
  });
}

export async function notifyNewTicket(
  businessId: Types.ObjectId,
  ticketId: Types.ObjectId,
  customerName: string,
  priority: string,
): Promise<void> {
  await createNotification({
    businessId,
    type: 'NEW_TICKET',
    title: 'New support ticket',
    message: `${customerName} — ${priority} priority`,
    link: `/dashboard/tickets?id=${ticketId.toString()}`,
  });
}

export async function notifyEscalation(
  businessId: Types.ObjectId,
  ticketId: Types.ObjectId,
  customerName: string,
  triggers: string[],
): Promise<void> {
  const triggerLabel = triggers.length > 0 ? triggers[0] : 'escalation rule';
  await createNotification({
    businessId,
    type: 'ESCALATION',
    title: 'Escalation triggered',
    message: `${customerName} — matched: ${triggerLabel}`,
    link: `/dashboard/tickets?id=${ticketId.toString()}`,
  });
}
