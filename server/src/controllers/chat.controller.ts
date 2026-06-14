import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import * as botConfigService from '../services/bot-config.service';
import * as feedbackService from '../services/feedback.service';
import * as ragService from '../services/rag.service';
import { AppError } from '../middleware/errorHandler';

/** Runs validators and returns 400 on failure. */
export function validateChatPost(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(', ');
      next(new AppError(message, 400));
      return;
    }

    next();
  };
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { businessId, conversationId, customerName, customerEmail, message } = req.body;
    const result = await ragService.handleChat({
      businessId,
      conversationId,
      customerName,
      customerEmail,
      message,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSuggestedQuestions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const businessId = String(req.query.businessId || '');
    const questions = await botConfigService.getSuggestedQuestions(businessId);
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}

export async function submitFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messageId, rating, businessId } = req.body;
    const result = await feedbackService.submitMessageFeedback(messageId, rating, businessId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPublicConfig(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const businessId = String(req.query.businessId || '');
    const config = await botConfigService.getPublicBotConfig(businessId);
    res.json({ config });
  } catch (err) {
    next(err);
  }
}
