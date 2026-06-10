import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as ticketsController from '../controllers/tickets.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'AGENT'));

router.get(
  '/',
  validate([
    query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    query('priority').optional().isIn(['URGENT', 'HIGH', 'MEDIUM', 'LOW']),
  ]),
  ticketsController.list,
);

router.get(
  '/:id',
  validate([param('id').isMongoId().withMessage('Invalid ticket id')]),
  ticketsController.getOne,
);

router.patch(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid ticket id'),
    body('status')
      .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
      .withMessage('Invalid status'),
  ]),
  ticketsController.update,
);

router.post(
  '/',
  validate([
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('query').trim().notEmpty().withMessage('Query is required'),
    body('priority').isIn(['URGENT', 'HIGH', 'MEDIUM', 'LOW']).withMessage('Invalid priority'),
    body('conversationId').optional().isMongoId(),
  ]),
  ticketsController.create,
);

export default router;
