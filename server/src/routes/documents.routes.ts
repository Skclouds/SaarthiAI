import { Router } from 'express';
import * as documentsController from '../controllers/documents.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { mongoIdParam } from '../middleware/validators';
import { handleUpload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.get('/', documentsController.list);
router.post('/upload', requireRole('ADMIN'), handleUpload, documentsController.upload);
router.delete('/:id', requireRole('ADMIN'), validate([mongoIdParam()]), documentsController.remove);
router.post('/:id/reindex', requireRole('ADMIN'), validate([mongoIdParam()]), documentsController.reindex);

export default router;
