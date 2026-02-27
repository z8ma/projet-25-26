import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/verify-email', authController.verifyEmail.bind(authController));
router.post('/resend-verification', authController.resendVerification.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback.bind(authController)
);

router.post('/google/complete', authController.completeGoogleSignup.bind(authController));

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.me.bind(authController));
router.put('/change-password', authMiddleware, authController.changePassword.bind(authController));
router.delete('/account', authMiddleware, authController.deleteAccount.bind(authController));

export default router;
