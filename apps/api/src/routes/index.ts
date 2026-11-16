import { Router } from 'express';
import authRoutes from './authRoutes';
import bookRoutes from './bookRoutes';
import copyRoutes from './copyRoutes';
import reservationRoutes from './reservationRoutes';
import borrowRoutes from './borrowRoutes';
import memberRoutes from './memberRoutes';
import reportRoutes from './reportRoutes';
import notificationRoutes from './notificationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/copies', copyRoutes);
router.use('/reservations', reservationRoutes);
router.use('/borrowing', borrowRoutes);
router.use('/members', memberRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

export default router;
