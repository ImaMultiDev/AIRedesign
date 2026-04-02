import type { DefaultSession } from "next-auth";
import type { UserRole, SubscriptionStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      subscriptionStatus: SubscriptionStatus;
      subscriptionCurrentPeriodEnd: Date | null;
      isPlus: boolean;
    };
  }

  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionCurrentPeriodEnd?: string | null;
    isPlus?: boolean;
    email?: string | null;
    name?: string | null;
  }
}
