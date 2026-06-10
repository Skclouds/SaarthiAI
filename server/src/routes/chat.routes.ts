import { Router } from 'express';
import { body, query } from 'express-validator';
import * as chatController from '../controllers/chat.controller';
import { validate } from '../middleware/validate';

const router = Router();

router.get(
  '/suggested-questions',
  validate([
    query('businessId').notEmpty().withMessage('businessId is required'),
  ]),
  chatController.getSuggestedQuestions,
);

router.get(
  '/config',
  validate([
    query('businessId').notEmpty().withMessage('businessId is required'),
  ]),
  chatController.getPublicConfig,
);

router.post(
  '/feedback',
  validate([
    body('messageId').notEmpty().withMessage('messageId is required'),
    body('rating').isIn(['UP', 'DOWN']).withMessage('rating must be UP or DOWN'),
  ]),
  chatController.submitFeedback,
);

router.post(
  '/',
  chatController.logChatRequest,
  chatController.validateChatPost([
    body('businessId').notEmpty().withMessage('businessId is required'),
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerEmail').isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('conversationId').optional({ values: 'null' }).isString().withMessage('conversationId must be a string'),
  ]),
  chatController.sendMessage,
);

export default router;
