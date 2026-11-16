import { Router } from 'express';
import { reservationController } from '../controllers/reservationController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validate';
import { reservationRequestSchema } from '@library/shared';

const router = Router();

router.get('/', authenticate, requireRole(['ADMIN']), reservationController.getAll);
router.get('/my', authenticate, reservationController.getMy);
router.post('/request', authenticate, validateRequest(reservationRequestSchema), reservationController.request);
router.patch('/:id/approve', authenticate, requireRole(['ADMIN']), reservationController.approve);
router.patch('/:id/reject', authenticate, requireRole(['ADMIN']), reservationController.reject);
router.patch('/:id/cancel', authenticate, reservationController.cancel);

export default router;
