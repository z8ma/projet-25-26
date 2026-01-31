import { Router } from 'express';
import { uploadController, upload } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Upload portfolio image
router.post('/portfolio', upload.single('image'), uploadController.uploadPortfolioImage.bind(uploadController));

// Delete portfolio image
router.delete('/portfolio/:filename', uploadController.deletePortfolioImage.bind(uploadController));

export default router;
