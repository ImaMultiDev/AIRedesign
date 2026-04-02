"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BlurUpImage } from "@/components/landing/blur-up-image";
import { BLUR_DATA_URL } from "@/data/mock-showcase";
import { ArrowDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 scale-105">
        <BlurUpImage
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85"
          alt="Interior de diseño generado con IA"
          sizes="100vw"
          priority
          blurDataURL={BLUR_DATA_URL}
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-background via-background/55 to-background"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.92_0.04_75/0.35),transparent)]" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-6 pb-16 pt-18 lg:pb-24 lg:pt-28 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-4xl space-y-8"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/90 sm:text-sm"
          >
            Rediseño de interiores con IA
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-heading text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.02] tracking-[-0.02em] text-foreground"
          >
            Espacios que se sienten{" "}
            <span className="relative">
              inevitables
              <span
                className="absolute -bottom-1 left-0 h-px w-full origin-left bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0"
                aria-hidden
              />
            </span>
            .
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Transformamos cualquier espacio en una propuesta que no imaginarías.
            Una experiencia nueva y sorprendente pensada para llevar cualquier
            lugar deseado a otro nivel.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
            <a
              href="#galeria"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Ver transformaciones
              <ArrowDown className="size-4" aria-hidden />
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/80 px-8 py-3.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Membresía Plus
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="h-8 w-px bg-gradient-to-b from-transparent via-foreground/30 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
