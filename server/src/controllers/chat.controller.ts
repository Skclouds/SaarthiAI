import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import * as botConfigService from '../services/bot-config.service';
import * as feedbackService from '../services/feedback.service';
import * as ragService from '../services/rag.service';
import { AppError } from '../middleware/errorHandler';

/** Logs incoming POST /chat body before validation runs. */
export function logChatRequest(req: Request, _res: Response, next: NextFunction): void {
  console.log('[POST /chat] received body:', req.body);
  next();
}

/** Runs validators and logs the exact validation failure before returning 400. */
export function validateChatPost(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const details = errors.array();
      console.error('[POST /chat] validation error:', details);
      console.error('[POST /chat] received body:', req.body);
      const message = details.map((e) => e.msg).join(', ');
      next(new AppError(message, 400));
      return;
    }

    next();
  };
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Public endpoint: businessId and message come from the request body (embed widget has no auth).
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
    const { messageId, rating } = req.body;
    const result = await feedbackService.submitMessageFeedback(messageId, rating);
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
