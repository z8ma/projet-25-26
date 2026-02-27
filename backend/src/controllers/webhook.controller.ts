import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import stripe from '../config/stripe.js';
import Stripe from 'stripe';

export class WebhookController {
  // POST /api/webhooks/stripe - Handle Stripe webhook events
  async handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // For testing without webhook signature verification
        event = req.body as Stripe.Event;
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { userId, planId, billingCycle } = session.metadata || {};

    if (!userId || !planId) {
      console.error('Missing metadata in checkout session');
      return;
    }

    const stripeSubscriptionId = session.subscription as string;
    const stripeCustomerId = session.customer as string;

    // Idempotence: skip if this Stripe subscription is already recorded
    const existing = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });
    if (existing) {
      console.log(`Checkout already processed for Stripe subscription ${stripeSubscriptionId}`);
      return;
    }

    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Cancel old active subscriptions — both in DB and on Stripe
    const oldSubs = await prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE' },
    });
    for (const oldSub of oldSubs) {
      if (oldSub.stripeSubscriptionId && oldSub.stripeSubscriptionId !== stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(oldSub.stripeSubscriptionId);
        } catch (err) {
          console.error(`Failed to cancel old Stripe subscription ${oldSub.stripeSubscriptionId}:`, err);
        }
      }
    }
    await prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    // Calculate reset date (1 month from now)
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);

    // Create new subscription
    await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        billingCycle: billingCycle || 'monthly',
        stripeCustomerId,
        stripeSubscriptionId,
        resetDate,
        startedAt: new Date(),
        expiresAt: (stripeSubscription as any).current_period_end
          ? new Date((stripeSubscription as any).current_period_end * 1000)
          : null,
      },
    });

    console.log(`Subscription created for user ${userId} with plan ${planId}`);
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      console.log('No local subscription found for Stripe subscription:', stripeSubscription.id);
      return;
    }

    // Update subscription status
    let status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' = 'ACTIVE';
    if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'unpaid') {
      status = 'CANCELLED';
    } else if (stripeSubscription.status === 'past_due') {
      status = 'EXPIRED';
    }

    // Sync planId from Stripe price (handles Customer Portal plan changes)
    const updateData: any = {
      status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      expiresAt: (stripeSubscription as any).current_period_end
        ? new Date((stripeSubscription as any).current_period_end * 1000)
        : null,
    };

    const stripePriceId = stripeSubscription.items.data[0]?.price?.id;
    if (stripePriceId) {
      const matchingPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          OR: [
            { stripePriceIdMonthly: stripePriceId },
            { stripePriceIdYearly: stripePriceId },
          ],
        },
      });
      if (matchingPlan && matchingPlan.id !== subscription.planId) {
        updateData.planId = matchingPlan.id;
        updateData.billingCycle = matchingPlan.stripePriceIdYearly === stripePriceId ? 'yearly' : 'monthly';
        console.log(`Plan synced to ${matchingPlan.name} for subscription ${subscription.id}`);
      }
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData,
    });

    console.log(`Subscription ${subscription.id} updated to status: ${status}`);
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELLED' },
      });
      console.log(`Subscription ${subscription.id} cancelled`);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const stripeSubscriptionId = (invoice as any).subscription as string;
    const billingReason = (invoice as any).billing_reason as string;

    if (!stripeSubscriptionId) return;

    // Only reset credits on actual renewal cycles, not on proration invoices
    // (proration happens on plan upgrades/downgrades and should not reset credits)
    if (billingReason !== 'subscription_cycle') {
      console.log(`Skipping credit reset for billing_reason: ${billingReason}`);
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (subscription) {
      // Reset credits on successful renewal payment
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          aiCreditsUsed: 0,
          projectsUsed: 0,
          resetDate,
          status: 'ACTIVE',
        },
      });
      console.log(`Credits reset for subscription ${subscription.id}`);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const stripeSubscriptionId = (invoice as any).subscription as string;

    if (!stripeSubscriptionId) return;

    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
      include: { user: true },
    });

    if (subscription) {
      console.log(`Payment failed for subscription ${subscription.id}`);
      // Could send notification to user here
    }
  }
}

export const webhookController = new WebhookController();
