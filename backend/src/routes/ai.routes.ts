import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Conversations
router.get('/conversations', aiController.getConversations.bind(aiController));
router.post('/conversations', aiController.createConversation.bind(aiController));
router.get('/conversations/:id', aiController.getConversation.bind(aiController));
router.delete('/conversations/:id', aiController.deleteConversation.bind(aiController));

// Messages
router.post('/conversations/:id/messages', aiController.addMessage.bind(aiController));
router.put('/conversations/:id/title', aiController.updateTitle.bind(aiController));
router.put('/conversations/:id/complete', aiController.completeConversation.bind(aiController));

export default router;
