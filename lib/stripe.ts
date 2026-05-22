import Stripe from "stripe";
import type { SubscriptionPlan } from "@prisma/client";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  _stripe = new Stripe(key);
  return _stripe;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export interface PlanOption {
  id: "premium-monthly" | "premium-yearly" | "family-monthly";
  plan: SubscriptionPlan;
  label: string;
  priceLabel: string;
  /** USD cents — descriptive only; Stripe is the source of truth for prices. */
  amountCents: number;
  /** ENV var holding the Stripe Price ID. */
  envKey:
    | "STRIPE_PRICE_PREMIUM_MONTHLY"
    | "STRIPE_PRICE_PREMIUM_YEARLY"
    | "STRIPE_PRICE_FAMILY_MONTHLY";
}

export const PLAN_OPTIONS: readonly PlanOption[] = [
  {
    id: "premium-monthly",
    plan: "premium",
    label: "Premium · ежемесячно",
    priceLabel: "$4.99 / мес",
    amountCents: 499,
    envKey: "STRIPE_PRICE_PREMIUM_MONTHLY",
  },
  {
    id: "premium-yearly",
    plan: "premium",
    label: "Premium · ежегодно",
    priceLabel: "$39.99 / год",
    amountCents: 3999,
    envKey: "STRIPE_PRICE_PREMIUM_YEARLY",
  },
  {
    id: "family-monthly",
    plan: "family",
    label: "Family · ежемесячно",
    priceLabel: "$9.99 / мес",
    amountCents: 999,
    envKey: "STRIPE_PRICE_FAMILY_MONTHLY",
  },
];

export function planOptionById(id: string): PlanOption | undefined {
  return PLAN_OPTIONS.find((p) => p.id === id);
}

export function priceIdToPlan(priceId: string | null | undefined): SubscriptionPlan {
  if (!priceId) return "free";
  for (const opt of PLAN_OPTIONS) {
    if (process.env[opt.envKey] === priceId) return opt.plan;
  }
  return "free";
}
