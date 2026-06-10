import { Router } from 'express';
import * as escalationsController from '../controllers/escalations.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'AGENT'));

router.get('/summary', escalationsController.summary);
router.get('/tickets', escalationsController.listByPriority);

export default router;
