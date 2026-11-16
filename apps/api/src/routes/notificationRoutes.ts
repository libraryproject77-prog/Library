import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validate';
import { createAnnouncementSchema } from '@library/shared';

const router = Router();

router.get('/', authenticate, notificationController.getMyNotifications);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.get('/announcements', authenticate, notificationController.getAnnouncements);
router.post('/announcements', authenticate, requireRole(['ADMIN']), validateRequest(createAnnouncementSchema), notificationController.createAnnouncement);

export default router;
