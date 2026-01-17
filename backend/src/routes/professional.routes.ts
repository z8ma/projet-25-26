import { Router } from 'express';
import { professionalController } from '../controllers/professional.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public route
router.get('/professions', professionalController.getProfessions.bind(professionalController));

// Protected routes
router.use(authMiddleware);
router.get('/profile', professionalController.getProfile.bind(professionalController));
router.put('/profile', professionalController.updateProfile.bind(professionalController));

export default router;
