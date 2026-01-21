import { Router } from 'express';
import { professionalController } from '../controllers/professional.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public route
router.get('/professions', professionalController.getProfessions.bind(professionalController));

// Protected routes
router.use(authMiddleware);

// Profile
router.get('/profile', professionalController.getProfile.bind(professionalController));
router.put('/profile', professionalController.updateProfile.bind(professionalController));

// Professions
router.post('/professions', professionalController.addProfession.bind(professionalController));
router.delete('/professions/:id', professionalController.removeProfession.bind(professionalController));

// Skills
router.post('/skills', professionalController.addSkill.bind(professionalController));
router.put('/skills/:id', professionalController.updateSkill.bind(professionalController));
router.delete('/skills/:id', professionalController.removeSkill.bind(professionalController));

// Portfolio
router.post('/portfolio', professionalController.addPortfolio.bind(professionalController));
router.put('/portfolio/:id', professionalController.updatePortfolio.bind(professionalController));
router.delete('/portfolio/:id', professionalController.removePortfolio.bind(professionalController));

// Messages
router.get('/messages', professionalController.getMessages.bind(professionalController));
router.put('/messages/:id/read', professionalController.markMessageAsRead.bind(professionalController));

export default router;
