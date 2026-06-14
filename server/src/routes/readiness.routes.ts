import { Router } from 'express';
import * as readinessController from '../controllers/readiness.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/overview', readinessController.overview);
router.get('/attempts', readinessController.attempts);

export default router;
