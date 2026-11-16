import { Router } from 'express';
import { borrowController } from '../controllers/borrowController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validate';
import { issueBookSchema, returnBookSchema } from '@library/shared';

const router = Router();

router.get('/', authenticate, requireRole(['ADMIN']), borrowController.getAll);
router.get('/my', authenticate, borrowController.getMy);
router.post('/issue', authenticate, requireRole(['ADMIN']), validateRequest(issueBookSchema), borrowController.issue);
router.post('/return/:id', authenticate, requireRole(['ADMIN']), validateRequest(returnBookSchema), borrowController.return);

export default router;
