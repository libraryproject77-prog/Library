import { Router } from 'express';
import { memberController } from '../controllers/memberController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', authenticate, requireRole(['ADMIN']), memberController.getAll);
router.get('/:id', authenticate, requireRole(['ADMIN']), memberController.getById);
router.patch('/:id/toggle-status', authenticate, requireRole(['ADMIN']), memberController.toggleStatus);

export default router;
