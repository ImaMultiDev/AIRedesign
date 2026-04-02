import { timingSafeEqual } from "node:crypto";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/** Misma fuente que el seed: sesión válida con ADMIN_SEED_EMAIL + ADMIN_SEED_PASSWORD. */
const ADMIN_SESSION_USER_ID = "admin-seed-env";

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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
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
            };
          }
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.password) return null;

          const ok = await bcrypt.compare(password, user.password);
          if (!ok) return null;

          return { id: user.id, email: user.email, name: user.name };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
