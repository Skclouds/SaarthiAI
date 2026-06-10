import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as conversationService from '../services/conversation.service';

function parsePagination(req: Request): { page: number; limit: number } {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  return { page, limit };
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const { page, limit } = parsePagination(req);
    const result = await conversationService.listConversations(
      req.user.businessId,
      page,
      limit,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const conversation = await conversationService.getConversationDetail(
      String(req.params.id),
      req.user.businessId,
    );
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const q = String(req.query.q || '');
    const { page, limit } = parsePagination(req);
    const result = await conversationService.searchConversations(
      req.user.businessId,
      q,
      page,
      limit,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
