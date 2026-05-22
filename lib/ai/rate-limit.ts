// Free-tier limiter for AI questions.
//
//   Free        — 5 successful answers per user per UTC day.
//   Premium     — unlimited.
//   Family      — unlimited (per-seat enforcement is Stripe-side metering).
//
// "Successful" means rows in AskHistory that aren't a refusal (refusals are
// pure pattern-matching and effectively free for us).

import { db } from "@/lib/db";

export const FREE_DAILY_LIMIT = 5;

export interface QuotaState {
  plan: "free" | "premium" | "family";
  used: number;
  limit: number; // Infinity for paid plans
  remaining: number;
}

export async function getQuota(userId: string): Promise<QuotaState> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true, isActive: true, expiresAt: true },
  });

  const isPaid =
    subscription?.isActive &&
    (subscription.plan === "premium" || subscription.plan === "family") &&
    (!subscription.expiresAt || subscription.expiresAt > new Date());

  if (isPaid) {
    return { plan: subscription.plan, used: 0, limit: Infinity, remaining: Infinity };
  }

  const start = startOfUtcDay();
  const used = await db.askHistory.count({
    where: {
      userId,
      wasRefused: false,
      createdAt: { gte: start },
    },
  });

  return {
    plan: "free",
    used,
    limit: FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
  };
}

export function startOfUtcDay(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
