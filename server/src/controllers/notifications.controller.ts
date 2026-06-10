import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as notificationService from '../services/notification.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const result = await notificationService.listNotifications(req.user.businessId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const notification = await notificationService.markNotificationRead(
      String(req.params.id),
      req.user.businessId,
    );
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const result = await notificationService.markAllNotificationsRead(req.user.businessId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
