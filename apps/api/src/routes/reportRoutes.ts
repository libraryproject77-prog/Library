import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/stats', authenticate, requireRole(['ADMIN']), reportController.getStats);
router.get('/inventory', authenticate, requireRole(['ADMIN']), reportController.getInventoryReport);
router.get('/borrowing', authenticate, requireRole(['ADMIN']), reportController.getBorrowingReport);
router.get('/overdue', authenticate, requireRole(['ADMIN']), reportController.getOverdueReport);

export default router;
