import { timingSafeEqual } from "node:crypto";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import bcrypt from "bcryptjs";
import type { UserRole, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_USER_ID } from "@/lib/auth-constants";
import { computeIsPlus } from "@/lib/subscription";
import { sendMagicLinkEmail } from "@/lib/resend-mail";

function timingSafeStringEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

async function refreshTokenFromDb(token: {
  id?: string;
  role?: UserRole;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionCurrentPeriodEnd?: string | null;
  isPlus?: boolean;
}) {
  const id = token.id;
  if (!id || id === ADMIN_SESSION_USER_ID) {
    token.role = "ADMIN";
    token.subscriptionStatus = "NONE";
    token.subscriptionCurrentPeriodEnd = null;
    token.isPlus = false;
    return token;
  }

  try {
    const row = await prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
        subscriptionStatus: true,
        subscriptionCurrentPeriodEnd: true,
      },
    });
    if (!row) return token;
    token.role = row.role;
    token.subscriptionStatus = row.subscriptionStatus;
    token.subscriptionCurrentPeriodEnd =
      row.subscriptionCurrentPeriodEnd?.toISOString() ?? null;
    token.isPlus = computeIsPlus(
      row.subscriptionStatus,
      row.subscriptionCurrentPeriodEnd,
    );
  } catch {
    /* BD no disponible */
  }
  return token;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: "",
      from:
        process.env.EMAIL_FROM?.trim() ||
        "onboarding@resend.dev",
      maxAge: 60 * 60,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const seedEmail = process.env.ADMIN_SEED_EMAIL?.trim();
        const seedPassword = process.env.ADMIN_SEED_PASSWORD;
        if (seedEmail && seedPassword !== undefined && seedPassword !== "") {
          if (
            normalizeEmail(email) === normalizeEmail(seedEmail) &&
            timingSafeStringEqual(password, seedPassword)
          ) {
            return {
              id: ADMIN_SESSION_USER_ID,
              email: email.trim(),
              name: "Administrador",
              role: "ADMIN" as UserRole,
            };
          }
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.password) return null;
          if (user.role !== "ADMIN") return null;

          const ok = await bcrypt.compare(password, user.password);
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "email" && user?.email) {
        const seed = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
        if (seed && user.email.toLowerCase() === seed) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
        token.email = user.email;
        token.name = user.name;
      }
      const refreshed = await refreshTokenFromDb(
        token as {
          id?: string;
          role?: UserRole;
          subscriptionStatus?: SubscriptionStatus;
          subscriptionCurrentPeriodEnd?: string | null;
          isPlus?: boolean;
        },
      );
      Object.assign(token, refreshed);
      if (trigger === "update" && token.id && token.id !== ADMIN_SESSION_USER_ID) {
        const row = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            subscriptionStatus: true,
            subscriptionCurrentPeriodEnd: true,
          },
        });
        if (row) {
          token.subscriptionStatus = row.subscriptionStatus;
          token.subscriptionCurrentPeriodEnd =
            row.subscriptionCurrentPeriodEnd?.toISOString() ?? null;
          token.isPlus = computeIsPlus(
            row.subscriptionStatus,
            row.subscriptionCurrentPeriodEnd,
          );
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = (token.role ?? "USER") as UserRole;
        session.user.subscriptionStatus = (token.subscriptionStatus ??
          "NONE") as SubscriptionStatus;
        session.user.subscriptionCurrentPeriodEnd =
          token.subscriptionCurrentPeriodEnd
            ? new Date(token.subscriptionCurrentPeriodEnd as string)
            : null;
        session.user.isPlus = Boolean(token.isPlus);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
