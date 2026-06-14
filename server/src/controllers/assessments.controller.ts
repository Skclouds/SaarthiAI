import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as assessmentService from '../services/assessment.service';

export async function generate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const numQuestions = req.body.numQuestions ?? 8;
    const assessment = await assessmentService.generateAssessment(
      req.user.businessId,
      req.body.documentId,
      numQuestions,
    );

    res.status(201).json({ assessment });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const assessments = await assessmentService.listAssessments(req.user.businessId);
    res.json({ assessments });
  } catch (err) {
    next(err);
  }
}

export async function getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assessment = await assessmentService.getPublicAssessment(String(req.params.id));
    res.json({ assessment });
  } catch (err) {
    next(err);
  }
}

export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await assessmentService.submitAssessment(String(req.params.id), {
      learnerName: req.body.learnerName,
      learnerEmail: req.body.learnerEmail,
      answers: req.body.answers,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}
