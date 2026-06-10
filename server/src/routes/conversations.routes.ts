import { Router } from 'express';
import { param, query } from 'express-validator';
import * as conversationsController from '../controllers/conversations.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'AGENT'));

router.get(
  '/search',
  validate([
    query('q').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  conversationsController.search,
);

router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  conversationsController.list,
);

router.get(
  '/:id',
  validate([param('id').isMongoId().withMessage('Invalid conversation id')]),
  conversationsController.getOne,
);

export default router;
