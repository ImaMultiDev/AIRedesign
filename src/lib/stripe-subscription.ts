import type Stripe from "stripe";
import type { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe-client";
import { sendSubscriptionActiveEmail } from "@/lib/resend-mail";

export function mapStripeStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELED";
    case "past_due":
      return "PAST_DUE";
    case "trialing":
      return "TRIALING";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    case "unpaid":
      return "UNPAID";
    case "paused":
      return "CANCELED";
    default:
      return "NONE";
  }
}

/** Fin del periodo de facturación (Stripe API reciente: por ítem). */
function periodEndFromSubscription(sub: Stripe.Subscription): Date | null {
  const items = sub.items?.data;
  if (items?.length) {
    const end = Math.max(...items.map((i) => i.current_period_end));
    return new Date(end * 1000);
  }
  return null;
}

export async function applySubscriptionToUser(
  userId: string,
  subscriptionId: string,
  customerId: string,
  options?: { sendEmail?: boolean },
) {
  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const status = mapStripeStatus(sub.status);
  const periodEnd = periodEndFromSubscription(sub);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: status,
      subscriptionCurrentPeriodEnd: periodEnd,
    },
  });

  if (options?.sendEmail && user.email && status === "ACTIVE") {
    await sendSubscriptionActiveEmail(user.email, user.name);
  }
}

export async function syncSubscriptionByStripeId(subscriptionId: string) {
  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = sub.metadata?.userId;
  if (!userId) return;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const status = mapStripeStatus(sub.status);
  const periodEnd = periodEndFromSubscription(sub);
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: status,
      subscriptionCurrentPeriodEnd: periodEnd,
    },
  });
}

export async function markSubscriptionEnded(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: null,
      subscriptionStatus: "CANCELED",
      subscriptionCurrentPeriodEnd: null,
    },
  });
}
