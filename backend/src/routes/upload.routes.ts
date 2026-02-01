import { Router } from 'express';
import { uploadController, upload, uploadMemory } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Brainstorming image uploads (Cloudinary)
router.post('/brainstorming', uploadMemory.single('image'), uploadController.uploadBrainstormingImage.bind(uploadController));
router.post('/brainstorming/multiple', uploadMemory.array('images', 5), uploadController.uploadBrainstormingImages.bind(uploadController));

// Portfolio image uploads (Local storage)
router.post('/portfolio', upload.single('image'), uploadController.uploadPortfolioImage.bind(uploadController));
router.delete('/portfolio/:filename', uploadController.deletePortfolioImage.bind(uploadController));

export default router;
