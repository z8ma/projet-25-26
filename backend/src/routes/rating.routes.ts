import { Router } from 'express';
import { ratingController } from '../controllers/rating.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.post('/', ratingController.createRating.bind(ratingController));
router.get('/match/:matchId', ratingController.getRating.bind(ratingController));

export default router;
