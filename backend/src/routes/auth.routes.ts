import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.me.bind(authController));
router.put('/change-password', authMiddleware, authController.changePassword.bind(authController));
router.delete('/account', authMiddleware, authController.deleteAccount.bind(authController));

export default router;
