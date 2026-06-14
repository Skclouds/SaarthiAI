import { Router } from 'express';
import { body, query } from 'express-validator';
import * as chatController from '../controllers/chat.controller';
import { validate } from '../middleware/validate';
import { mongoIdBody, mongoIdQuery, optionalMongoIdBody } from '../middleware/validators';

const MAX_CHAT_MESSAGE_LENGTH = 2000;

const router = Router();

router.get(
  '/suggested-questions',
  validate([
    mongoIdQuery('businessId'),
  ]),
  chatController.getSuggestedQuestions,
);

router.get(
  '/config',
  validate([
    mongoIdQuery('businessId'),
  ]),
  chatController.getPublicConfig,
);

router.post(
  '/feedback',
  validate([
    mongoIdBody('businessId'),
    mongoIdBody('messageId'),
    body('rating').isIn(['UP', 'DOWN']).withMessage('rating must be UP or DOWN'),
  ]),
  chatController.submitFeedback,
);

router.post(
  '/',
  chatController.validateChatPost([
    mongoIdBody('businessId'),
    body('customerName').trim().notEmpty().isLength({ max: 120 }).withMessage('Customer name is required'),
    body('customerEmail').isEmail().isLength({ max: 254 }).withMessage('Valid email is required'),
    body('message')
      .trim()
      .notEmpty()
      .isLength({ max: MAX_CHAT_MESSAGE_LENGTH })
      .withMessage(`Message must be at most ${MAX_CHAT_MESSAGE_LENGTH} characters`),
    optionalMongoIdBody('conversationId'),
  ]),
  chatController.sendMessage,
);

export default router;
