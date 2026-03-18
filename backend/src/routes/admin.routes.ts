import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { adminController } from '../controllers/admin.controller.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getStats);

export default router;
