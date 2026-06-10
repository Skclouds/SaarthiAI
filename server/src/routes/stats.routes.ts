import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'AGENT'));

router.get('/overview', statsController.overview);

export default router;
