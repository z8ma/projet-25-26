import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get current subscription
router.get('/current', subscriptionController.getCurrent.bind(subscriptionController));

// Get available plans
router.get('/plans', subscriptionController.getPlans.bind(subscriptionController));

// Create checkout session
router.post('/create-checkout', subscriptionController.createCheckout.bind(subscriptionController));

// Create customer portal session
router.post('/create-portal', subscriptionController.createPortal.bind(subscriptionController));

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription.bind(subscriptionController));

// Reactivate cancelled subscription
router.post('/reactivate', subscriptionController.reactivateSubscription.bind(subscriptionController));

export default router;
