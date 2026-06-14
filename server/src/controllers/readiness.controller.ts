import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as readinessService from '../services/readiness.service';

export async function overview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const overview = await readinessService.getReadinessOverview(req.user.businessId);
    res.json(overview);
  } catch (err) {
    next(err);
  }
}

export async function attempts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const attempts = await readinessService.listRecentAttempts(req.user.businessId);
    res.json({ attempts });
  } catch (err) {
    next(err);
  }
}
