import { Router } from 'express';
import { body } from 'express-validator';
import * as botConfigController from '../controllers/bot-config.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/', botConfigController.getConfig);

router.put(
  '/',
  validate([
    body('botName').trim().notEmpty().withMessage('Bot name is required'),
    body('welcomeMessage').trim().notEmpty().withMessage('Welcome message is required'),
    body('personality')
      .isIn(['Professional', 'Friendly', 'Technical'])
      .withMessage('Personality must be Professional, Friendly, or Technical'),
    body('escalationRules').isArray().withMessage('Escalation rules must be an array'),
    body('escalationRules.*.trigger').trim().notEmpty().withMessage('Each rule needs a trigger'),
    body('escalationRules.*.priority')
      .isIn(['URGENT', 'HIGH', 'MEDIUM', 'LOW'])
      .withMessage('Priority must be URGENT, HIGH, MEDIUM, or LOW'),
    body('suggestedQuestions').optional().isArray(),
  ]),
  botConfigController.updateConfig,
);

export default router;
