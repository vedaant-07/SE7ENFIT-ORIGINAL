// Subscription API - SE7EN FIT
// Subscription plans and management.

import { api } from './client';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration_days: number;
  features?: string[];
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled' | 'trialing';
  started_at?: string;
  expires_at?: string;
  [key: string]: unknown;
};

// SE7EN FIT subscription plans (matching product requirements)
export const SUBSCRIPTION_PLANS = {
  free_trial: {
    name: 'Free Trial',
    price: 0,
    currency: 'INR',
    duration_days: 7,
    description: '7 days limited access',
  },
  basic_monthly: {
    name: 'Basic Monthly',
    price: 299,
    currency: 'INR',
    duration_days: 30,
    description: 'Limited access',
  },
  premium_monthly: {
    name: 'Premium Monthly',
    price: 499,
    currency: 'INR',
    duration_days: 30,
    description: 'Unlock all features',
  },
  quarterly: {
    name: 'Quarterly',
    price: 2999,
    currency: 'INR',
    duration_days: 90,
    description: 'Unlock all features',
  },
  annual: {
    name: 'Annual',
    price: 5999,
    currency: 'INR',
    duration_days: 365,
    description: 'Unlock all features',
  },
} as const;

export async function getActiveSubscription(): Promise<Subscription | null> {
  // TODO: Confirm exact backend endpoint
  return api.get<Subscription | null>('/subscriptions/active');
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  // TODO: Confirm exact backend endpoint
  return api.get<SubscriptionPlan[]>('/subscriptions/plans');
}

export async function createSubscription(planId: string): Promise<{ checkout_url?: string; subscription: Subscription }> {
  // TODO: Integrate with payment gateway
  // Payment gateway pending - do not fake success
  return api.post<{ checkout_url?: string; subscription: Subscription }>('/subscriptions', { plan_id: planId });
}

export async function cancelSubscription(): Promise<void> {
  return api.post('/subscriptions/cancel', {});
}
