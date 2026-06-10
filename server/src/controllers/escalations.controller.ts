import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as ticketService from '../services/ticket.service';

export async function summary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const counts = await ticketService.getEscalationSummary(req.user.businessId);
    res.json({ summary: counts });
  } catch (err) {
    next(err);
  }
}

export async function listByPriority(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const tickets = await ticketService.listEscalatedTickets(req.user.businessId);
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
}
