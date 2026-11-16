import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authController.logout);

export default router;
