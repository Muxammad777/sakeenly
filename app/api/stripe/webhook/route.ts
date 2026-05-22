import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, priceIdToPlan } from "@/lib/stripe";
import { db } from "@/lib/db";

// Stripe signature verification MUST run against the raw body.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error("[stripe webhook] signature failure", err);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await onSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      default:
        // Ignore the long tail; only handle what affects entitlement.
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] handler failure for ${event.type}`, err);
    return NextResponse.json({ error: "handler_failure" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.warn("[stripe webhook] checkout completed without userId metadata", session.id);
    return;
  }
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!customerId) return;

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      plan: "free",
      isActive: false,
    },
    update: {
      stripeCustomerId: customerId,
    },
  });
}

async function onSubscriptionChange(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  // Find user either by metadata or by previously-stored customerId.
  let target = userId
    ? await db.subscription.findUnique({ where: { userId }, select: { userId: true } })
    : null;
  if (!target) {
    target = await db.subscription.findUnique({
      where: { stripeCustomerId: customerId },
      select: { userId: true },
    });
  }
  if (!target) {
    console.warn("[stripe webhook] could not resolve user for subscription", sub.id);
    return;
  }

  const priceId = sub.items.data[0]?.price.id;
  const plan = priceIdToPlan(priceId);

  const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;

  const isActive =
    sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";

  await db.subscription.update({
    where: { userId: target.userId },
    data: {
      plan: isActive ? plan : "free",
      stripeSubscriptionId: sub.id,
      stripeCustomerId: customerId,
      isActive,
      expiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}
