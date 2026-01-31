import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller.js';

const router = Router();

// Stripe webhook - no auth required, uses signature verification
router.post('/stripe', webhookController.handleStripeWebhook.bind(webhookController));

export default router;
