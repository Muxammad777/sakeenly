import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const sub = await db.subscription.findUnique({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  });
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: "no_stripe_customer" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const portal = await getStripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/profile`,
  });

  return NextResponse.json({ url: portal.url });
}
