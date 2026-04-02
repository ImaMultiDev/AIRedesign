import type { SubscriptionStatus } from "@prisma/client";

export function computeIsPlus(
  status: SubscriptionStatus,
  periodEnd: Date | null | undefined,
): boolean {
  if (status !== "ACTIVE" && status !== "TRIALING") return false;
  if (periodEnd && periodEnd.getTime() <= Date.now()) return false;
  return true;
}
