export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum SubscriptionPlanName {
  STARTER = 'Starter',
  PREMIUM = 'Premium',
}

export interface SubscriptionPlan {
  id: string;
  name: SubscriptionPlanName;
  priceMonthly: number;
  maxProjectsMonth: number;
  aiCreditsMonth: number;
  features?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  projectsUsed: number;
  aiCreditsUsed: number;
  resetDate: Date;
  startedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
}
