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
router.put('/matches/:matchId/creator-project-status', matchingController.creatorUpdateProjectStatus.bind(matchingController));

// Messaging
router.get('/conversations/professional', matchingController.getConversationsProfessional.bind(matchingController));
router.get('/conversations', matchingController.getConversations.bind(matchingController));
router.get('/matches/:matchId/messages', matchingController.getMessages.bind(matchingController));
router.post('/matches/:matchId/messages', matchingController.sendMessage.bind(matchingController));

export default router;
