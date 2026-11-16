import { Router } from 'express';
import { bookController } from '../controllers/bookController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateRequest } from '../middleware/validate';
import { createBookSchema, updateBookSchema } from '@library/shared';

const router = Router();

router.get('/categories', bookController.getCategories);
router.get('/', bookController.getAll);
router.get('/:id', bookController.getById);

// Admin-protected Book Catalog actions
router.post('/', authenticate, requireRole(['ADMIN']), validateRequest(createBookSchema), bookController.create);
router.put('/:id', authenticate, requireRole(['ADMIN']), validateRequest(updateBookSchema), bookController.update);
router.delete('/:id', authenticate, requireRole(['ADMIN']), bookController.delete);

export default router;
