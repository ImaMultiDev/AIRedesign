"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
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
          <span className="font-heading text-lg tracking-tight">AINterior</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="#galeria"
            className="transition-colors hover:text-foreground"
          >
            Galería
          </a>
          <Link
            href="/admin/login"
            className="rounded-full bg-primary px-4 py-2 text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Admin
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
