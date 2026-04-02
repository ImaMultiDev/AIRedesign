"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 z-40 w-full border-b border-foreground/[0.06] bg-background/75 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15">
            <Sparkles className="size-4 text-primary" aria-hidden />
          </span>
          <span className="font-heading text-lg tracking-tight">
            AIRedesign
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-6">
          <a
            href="#galeria"
            className="transition-colors hover:text-foreground"
          >
            Galería
          </a>
          <Link
            href="/pricing"
            className="transition-colors hover:text-foreground"
          >
            Plus
          </Link>
          {status === "loading" ? (
            <span className="hidden w-16 sm:inline" />
          ) : session?.user?.role === "USER" ? (
            <Link
              href="/cuenta"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "hidden rounded-full border-foreground/15 sm:inline-flex",
              )}
            >
              {session.user.isPlus ? "Tu cuenta · Plus" : "Mi cuenta"}
            </Link>
          ) : (
            <Link
              href="/login?callbackUrl=%2Fcuenta"
              className="transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
