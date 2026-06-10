import { Router } from 'express';
import { param } from 'express-validator';
import * as notificationsController from '../controllers/notifications.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'AGENT'));

router.get('/', notificationsController.list);

router.patch('/read-all', notificationsController.markAllRead);

router.patch(
  '/:id/read',
  validate([param('id').isMongoId().withMessage('Invalid notification id')]),
  notificationsController.markRead,
);

export default router;
