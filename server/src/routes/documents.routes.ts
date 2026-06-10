import { Router } from 'express';
import * as documentsController from '../controllers/documents.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { handleUpload } from '../middleware/upload';

const router = Router();

router.use(requireAuth);

router.get('/', documentsController.list);
router.post('/upload', requireRole('ADMIN'), handleUpload, documentsController.upload);
router.delete('/:id', requireRole('ADMIN'), documentsController.remove);
router.post('/:id/reindex', requireRole('ADMIN'), documentsController.reindex);

export default router;
