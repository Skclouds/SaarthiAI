import { Router } from 'express';
import { body } from 'express-validator';
import * as assessmentsController from '../controllers/assessments.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { mongoIdBody, mongoIdParam } from '../middleware/validators';

const router = Router();

router.post(
  '/generate',
  requireAuth,
  requireRole('ADMIN'),
  validate([
    mongoIdBody('documentId'),
    body('numQuestions')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('numQuestions must be between 1 and 20'),
  ]),
  assessmentsController.generate,
);

router.get('/', requireAuth, requireRole('ADMIN'), assessmentsController.list);

router.get(
  '/:id/public',
  validate([mongoIdParam()]),
  assessmentsController.getPublic,
);

router.post(
  '/:id/submit',
  validate([
    mongoIdParam(),
    body('learnerName').trim().notEmpty().isLength({ max: 120 }).withMessage('learnerName is required'),
    body('learnerEmail').isEmail().isLength({ max: 254 }).withMessage('Valid learnerEmail is required'),
    body('answers').isArray({ min: 1, max: 50 }).withMessage('answers must be a non-empty array'),
    body('answers.*.qid').notEmpty().withMessage('Each answer must have a qid'),
    body('answers.*.selectedIndex')
      .isInt({ min: 0, max: 3 })
      .withMessage('selectedIndex must be 0-3'),
  ]),
  assessmentsController.submit,
);

export default router;
