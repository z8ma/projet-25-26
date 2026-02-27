import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import stripe from '../config/stripe.js';

export class SubscriptionController {
  // GET /api/subscriptions/current - Get current user subscription with credits
  async getCurrent(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      // Find active subscription for the user
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // If no subscription, return free tier with real usage calculated from conversations
      if (!subscription) {
        const creator = await prisma.creator.findUnique({ where: { userId } });
        let aiCreditsUsed = 0;
        let projectsUsed = 0;
        if (creator) {
          const conversations = await prisma.aiConversation.findMany({
            where: { creatorId: creator.id },
            select: { aiCreditsUsed: true },
          });
          aiCreditsUsed = conversations.reduce((sum, c) => sum + (c.aiCreditsUsed || 0), 0);
          projectsUsed = conversations.length;
        }
        const FREE_CREDITS = 50;
        const FREE_PROJECTS = 3;
        return res.json({
          success: true,
          data: {
            plan: {
              name: 'Free',
              aiCreditsMonth: FREE_CREDITS,
              maxProjectsMonth: FREE_PROJECTS,
            },
            aiCreditsUsed,
            aiCreditsRemaining: Math.max(0, FREE_CREDITS - aiCreditsUsed),
            projectsUsed,
            projectsRemaining: Math.max(0, FREE_PROJECTS - projectsUsed),
            isFreeTier: true,
          },
        });
      }

      // Calculate remaining credits
      const aiCreditsRemaining = Math.max(0, subscription.plan.aiCreditsMonth - subscription.aiCreditsUsed);
      const projectsRemaining = Math.max(0, subscription.plan.maxProjectsMonth - subscription.projectsUsed);

      res.json({
        success: true,
        data: {
          id: subscription.id,
          plan: {
            id: subscription.plan.id,
            name: subscription.plan.name,
            aiCreditsMonth: subscription.plan.aiCreditsMonth,
            maxProjectsMonth: subscription.plan.maxProjectsMonth,
            priceMonthly: subscription.plan.priceMonthly,
            priceYearly: subscription.plan.priceYearly,
            features: subscription.plan.features,
          },
          aiCreditsUsed: subscription.aiCreditsUsed,
          aiCreditsRemaining,
          projectsUsed: subscription.projectsUsed,
          projectsRemaining,
          resetDate: subscription.resetDate,
          expiresAt: subscription.expiresAt,
          billingCycle: subscription.billingCycle,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          isFreeTier: false,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de l\'abonnement',
      });
    }
  }

  // GET /api/subscriptions/plans - Get all available plans
  async getPlans(req: Request, res: Response) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { priceMonthly: 'asc' },
      });

      res.json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des plans',
      });
    }
  }

  // POST /api/subscriptions/create-checkout - Create Stripe checkout session
  async createCheckout(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const { planId, billingCycle = 'monthly' } = req.body;

      if (!planId) {
        return res.status(400).json({
          success: false,
          message: 'Plan ID requis',
        });
      }

      // Get the plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan non trouvé',
        });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Block if user already has an active subscription
      const activeSub = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
      });
      if (activeSub) {
        if (activeSub.planId === planId) {
          return res.status(400).json({
            success: false,
            message: 'Tu es déjà abonné à ce plan',
            alreadySubscribed: true,
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Tu as déjà un abonnement actif. Utilise la mise à niveau pour changer de plan.',
          hasActiveSub: true,
        });
      }

      // Get or create Stripe customer
      let stripeCustomerId: string;
      const existingSub = await prisma.subscription.findFirst({
        where: { userId, stripeCustomerId: { not: null } },
      });

      if (existingSub?.stripeCustomerId) {
        stripeCustomerId = existingSub.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId },
        });
        stripeCustomerId = customer.id;
      }

      // Get the appropriate price ID
      const priceId = billingCycle === 'yearly'
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly;

      if (!priceId) {
        return res.status(400).json({
          success: false,
          message: 'Ce plan n\'est pas encore configuré pour les paiements',
        });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/settings?subscription=success`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing?subscription=cancelled`,
        metadata: {
          userId,
          planId,
          billingCycle,
        },
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création de la session de paiement',
      });
    }
  }

  // POST /api/subscriptions/create-portal - Create Stripe customer portal session
  async createPortal(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      // Get existing subscription with Stripe customer ID
      const subscription = await prisma.subscription.findFirst({
        where: { userId, stripeCustomerId: { not: null } },
      });

      if (!subscription?.stripeCustomerId) {
        return res.status(400).json({
          success: false,
          message: 'Aucun abonnement actif trouvé',
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL}/settings`,
      });

      res.json({
        success: true,
        data: { url: session.url },
      });
    } catch (error: any) {
      console.error('Portal error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création du portail',
      });
    }
  }

  // POST /api/subscriptions/upgrade - Upgrade/downgrade to another plan with proration
  async upgradeSubscription(req: Request, res: Response) {
    try {
      const userId = req.userId as string;
      const { planId, billingCycle = 'monthly' } = req.body;

      if (!planId) {
        return res.status(400).json({ success: false, message: 'Plan ID requis' });
      }

      // Get current active subscription
      const currentSub = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { plan: true },
      });

      if (!currentSub) {
        return res.status(404).json({ success: false, message: 'Aucun abonnement actif trouvé' });
      }

      if (currentSub.planId === planId) {
        return res.status(400).json({ success: false, message: 'Tu es déjà sur ce plan' });
      }

      if (!currentSub.stripeSubscriptionId) {
        return res.status(400).json({ success: false, message: 'Abonnement Stripe non trouvé' });
      }

      // Get new plan
      const newPlan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!newPlan) {
        return res.status(404).json({ success: false, message: 'Plan non trouvé' });
      }

      const newPriceId = billingCycle === 'yearly'
        ? newPlan.stripePriceIdYearly
        : newPlan.stripePriceIdMonthly;

      if (!newPriceId) {
        return res.status(400).json({ success: false, message: 'Ce plan n\'est pas configuré pour les paiements' });
      }

      // Retrieve current Stripe subscription to get item ID
      const stripeSubscription = await stripe.subscriptions.retrieve(currentSub.stripeSubscriptionId);
      const itemId = stripeSubscription.items.data[0].id;

      // Update subscription on Stripe — proration is automatic
      await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: 'always_invoice',
      });

      // Update local DB immediately with new plan
      await prisma.subscription.update({
        where: { id: currentSub.id },
        data: { planId, billingCycle },
      });

      res.json({ success: true, message: 'Abonnement mis à jour avec succès' });
    } catch (error: any) {
      console.error('Upgrade error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à niveau',
      });
    }
  }

  // POST /api/subscriptions/cancel - Cancel subscription
  async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Aucun abonnement actif trouvé',
        });
      }

      if (subscription.stripeSubscriptionId) {
        // Cancel at end of period on Stripe
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      }

      // Update local subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true },
      });

      res.json({
        success: true,
        message: 'Votre abonnement sera annulé à la fin de la période',
      });
    } catch (error: any) {
      console.error('Cancel error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'annulation',
      });
    }
  }

  // POST /api/subscriptions/reactivate - Reactivate cancelled subscription
  async reactivateSubscription(req: Request, res: Response) {
    try {
      const userId = req.userId as string;

      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE', cancelAtPeriodEnd: true },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Aucun abonnement à réactiver',
        });
      }

      if (subscription.stripeSubscriptionId) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: false,
        });
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: false },
      });

      res.json({
        success: true,
        message: 'Votre abonnement a été réactivé',
      });
    } catch (error: any) {
      console.error('Reactivate error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la réactivation',
      });
    }
  }

  // Helper: Increment AI credits used for a user
  static async useAiCredits(userId: string, amount: number = 1): Promise<boolean> {
    const FREE_CREDITS = 50;

    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
        },
      });

      // No subscription = free tier — enforce 50-credit limit
      if (!subscription) {
        const creator = await prisma.creator.findUnique({ where: { userId } });
        if (!creator) return true; // no profile yet, allow

        const conversations = await prisma.aiConversation.findMany({
          where: { creatorId: creator.id },
          select: { aiCreditsUsed: true },
        });
        const creditsUsed = conversations.reduce((sum, c) => sum + (c.aiCreditsUsed || 0), 0);

        if (creditsUsed + amount > FREE_CREDITS) {
          return false;
        }
        return true;
      }

      // Check if user has credits remaining
      if (subscription.aiCreditsUsed + amount > subscription.plan.aiCreditsMonth) {
        return false;
      }

      // Increment credits used
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          aiCreditsUsed: subscription.aiCreditsUsed + amount,
        },
      });

      return true;
    } catch (error) {
      console.error('Error using AI credits:', error);
      return false;
    }
  }
}

export const subscriptionController = new SubscriptionController();
