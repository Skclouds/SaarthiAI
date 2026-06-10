import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as statsService from '../services/stats.service';

export async function overview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const stats = await statsService.getOverviewStats(req.user.businessId);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

export async function analytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const from = req.query.from ? String(req.query.from) : undefined;
    const to = req.query.to ? String(req.query.to) : undefined;
    const analytics = await statsService.getAnalytics(req.user.businessId, from, to);
    res.json({ analytics });
  } catch (err) {
    next(err);
  }
}
