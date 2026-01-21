import { Router } from 'express';
import { matchingController } from '../controllers/matching.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Matching
router.post('/conversations/:conversationId/match', matchingController.generateMatches.bind(matchingController));
router.get('/conversations/:conversationId/matches', matchingController.getMatches.bind(matchingController));
router.put('/matches/:matchId/contact', matchingController.contactProfessional.bind(matchingController));
router.put('/matches/:matchId/project-status', matchingController.updateProjectStatus.bind(matchingController));

export default router;
