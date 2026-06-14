import { Router } from 'express';
import { query } from 'express-validator';
import * as statsController from '../controllers/stats.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'AGENT'));

router.get(
  '/',
  validate([
    query('from').optional().isISO8601().withMessage('from must be a valid date'),
    query('to').optional().isISO8601().withMessage('to must be a valid date'),
  ]),
  statsController.analytics,
);

export default router;
