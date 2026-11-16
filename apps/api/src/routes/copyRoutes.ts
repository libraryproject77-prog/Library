import { Router } from 'express';
import { copyController } from '../controllers/copyController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validate';
import { createCopySchema, updateCopyStatusSchema } from '@library/shared';

const router = Router();

router.get('/book/:bookId', copyController.getCopiesByBookId);
router.post('/', authenticate, requireRole(['ADMIN']), validateRequest(createCopySchema), copyController.addCopy);
router.patch('/:id/status', authenticate, requireRole(['ADMIN']), validateRequest(updateCopyStatusSchema), copyController.updateStatus);

export default router;
