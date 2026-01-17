import { Router } from 'express';
import { creatorController } from '../controllers/creator.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', creatorController.getProfile.bind(creatorController));
router.put('/profile', creatorController.updateProfile.bind(creatorController));

export default router;
