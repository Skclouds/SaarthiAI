import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as botConfigService from '../services/bot-config.service';

export async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const config = await botConfigService.getOrCreateBotConfig(req.user.businessId);
    res.json({ config });
  } catch (err) {
    next(err);
  }
}

export async function updateConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const { botName, welcomeMessage, personality, escalationRules, suggestedQuestions } = req.body;
    const config = await botConfigService.updateBotConfig(req.user.businessId, {
      botName,
      welcomeMessage,
      personality,
      escalationRules,
      suggestedQuestions,
    });
    res.json({ config });
  } catch (err) {
    next(err);
  }
}
