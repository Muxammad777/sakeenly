import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getStripe, isStripeConfigured, PLAN_OPTIONS, planOptionById } from "@/lib/stripe";

const bodySchema = z.object({
  planOptionId: z.enum(PLAN_OPTIONS.map((p) => p.id) as [string, ...string[]]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!user.email) {
    return NextResponse.json({ error: "missing_email_on_account" }, { status: 400 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const option = planOptionById(parsed.data.planOptionId);
  if (!option) return NextResponse.json({ error: "unknown_plan" }, { status: 400 });

  const priceId = process.env[option.envKey];
  if (!priceId) {
    return NextResponse.json(
      { error: "price_id_missing", envKey: option.envKey },
      { status: 503 },
    );
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  });

  const origin = new URL(req.url).origin;
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: subscription?.stripeCustomerId ?? undefined,
    customer_email: subscription?.stripeCustomerId ? undefined : user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/profile?upgraded=1`,
    cancel_url: `${origin}/pricing?cancelled=1`,
    allow_promotion_codes: true,
    metadata: { userId: user.id, plan: option.plan, planOptionId: option.id },
    subscription_data: { metadata: { userId: user.id, plan: option.plan } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "no_session_url" }, { status: 500 });
  }
  return NextResponse.json({ url: session.url });
}
