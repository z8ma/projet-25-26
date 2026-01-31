import { Router } from 'express';
import { favoritesController } from '../controllers/favorites.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/favorites - Get all saved professionals
router.get('/', favoritesController.getSavedProfessionals.bind(favoritesController));

// GET /api/favorites/check/:professionalId - Check if saved
router.get('/check/:professionalId', favoritesController.checkFavorite.bind(favoritesController));

// POST /api/favorites/:professionalId - Add to favorites
router.post('/:professionalId', favoritesController.addToFavorites.bind(favoritesController));

// PUT /api/favorites/:professionalId - Update note
router.put('/:professionalId', favoritesController.updateNote.bind(favoritesController));

// DELETE /api/favorites/:professionalId - Remove from favorites
router.delete('/:professionalId', favoritesController.removeFromFavorites.bind(favoritesController));

export default router;
