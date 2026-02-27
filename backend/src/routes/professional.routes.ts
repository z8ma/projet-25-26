import { Router } from 'express';
import { professionalController } from '../controllers/professional.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadPortfolioMedia } from '../controllers/upload.controller.js';

const router = Router();

// Public routes
router.get('/professions', professionalController.getProfessions.bind(professionalController));
router.get('/professions/list', professionalController.listProfessions.bind(professionalController));
router.get('/explore', professionalController.exploreProfessionals.bind(professionalController));
router.get('/explore/portfolios', professionalController.explorePortfolios.bind(professionalController));
router.get('/details/:id', professionalController.getProfessionalById.bind(professionalController));

// Discovery Engine Health Check (public pour monitoring)
router.get('/discovery/health', professionalController.getDiscoveryHealth.bind(professionalController));

// Semi-public routes (require auth but not necessarily pro)
router.post('/details/:id/message', authMiddleware, professionalController.sendDirectMessage.bind(professionalController));

// Protected routes
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', professionalController.getDashboardStats.bind(professionalController));

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

// Portfolio Media (images, videos, PDFs)
router.post('/portfolio/:portfolioId/media', uploadPortfolioMedia.single('file'), professionalController.uploadPortfolioMedia.bind(professionalController));
router.delete('/portfolio/:portfolioId/media/:mediaId', professionalController.deletePortfolioMedia.bind(professionalController));
router.put('/portfolio/:portfolioId/media/reorder', professionalController.reorderPortfolioMedia.bind(professionalController));

// Messages
router.get('/messages', professionalController.getMessages.bind(professionalController));
router.put('/messages/:id/read', professionalController.markMessageAsRead.bind(professionalController));

// Matches / Missions
router.get('/matches', professionalController.getMyMatches.bind(professionalController));
router.put('/matches/:matchId/respond', professionalController.respondToMatch.bind(professionalController));

// Follow / Unfollow
router.post('/follow/:id', professionalController.followProfessional.bind(professionalController));
router.delete('/follow/:id', professionalController.unfollowProfessional.bind(professionalController));
router.get('/follow/:id/status', professionalController.getFollowStatus.bind(professionalController));

// Portfolio Likes
router.post('/portfolio/:portfolioId/like', professionalController.likePortfolio.bind(professionalController));
router.delete('/portfolio/:portfolioId/like', professionalController.unlikePortfolio.bind(professionalController));
router.get('/portfolio/likes/status', professionalController.getLikedPortfolios.bind(professionalController));
router.get('/portfolio/liked-by-me', professionalController.getMyLikedPortfolios.bind(professionalController));

// Portfolio Comments
router.get('/portfolio/:portfolioId/comments', professionalController.getPortfolioComments.bind(professionalController));
router.post('/portfolio/:portfolioId/comments', professionalController.addPortfolioComment.bind(professionalController));
router.delete('/portfolio/comments/:commentId', professionalController.deletePortfolioComment.bind(professionalController));

// Discovery Engine Metrics & Cache Management
router.get('/discovery/metrics', professionalController.getDiscoveryMetrics.bind(professionalController));
router.post('/discovery/invalidate-cache', professionalController.invalidateDiscoveryCache.bind(professionalController));

export default router;
