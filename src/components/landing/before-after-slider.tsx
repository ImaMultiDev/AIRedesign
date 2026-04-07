"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopTheLookMarkers } from "@/components/landing/shop-the-look-markers";
import type { ShopPinPublic } from "@/types/showcase";

type Props = {
  beforeUrl: string;
  afterUrl: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeBadgeLabel?: string;
  afterBadgeLabel?: string;
  className?: string;
  shopPins?: ShopPinPublic[];
};

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeAlt = "Antes",
  afterAlt = "Propuesta de IA",
  beforeBadgeLabel = "Antes",
  afterBadgeLabel = "Propuesta de IA",
  className,
  shopPins,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingX = useRef<number | null>(null);
  const [pct, setPct] = useState(50);
  const [sliderLocked, setSliderLocked] = useState(false);

  const splitStyle = { left: `${pct}%` } as const;

  const applyClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const next = rect.width === 0 ? 50 : (x / rect.width) * 100;
    setPct(next);
  }, []);

  const scheduleClientX = useCallback(
    (clientX: number) => {
      pendingX.current = clientX;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingX.current != null) {
          applyClientX(pendingX.current);
        }
      });
    },
    [applyClientX],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{ touchAction: "none" }}
      className={cn(
        "relative aspect-[4/3] w-full max-h-[min(85vh,56rem)] select-none overflow-hidden rounded-2xl bg-muted shadow-2xl ring-1 ring-black/5",
        className,
      )}
      onPointerDown={(e) => {
        if (sliderLocked) return;
        if ((e.target as HTMLElement).closest("[data-shop-pin]")) return;
        dragging.current = true;
        wrapRef.current?.setPointerCapture(e.pointerId);
        scheduleClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (sliderLocked) return;
        if (!dragging.current) return;
        scheduleClientX(e.clientX);
      }}
      onPointerUp={(e) => {
        dragging.current = false;
        try {
          wrapRef.current?.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onLostPointerCapture={() => {
        dragging.current = false;
      }}
    >
      <Image
        src={afterUrl}
        alt={afterAlt}
        fill
        className="object-cover"
        sizes="100vw"
        priority
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <Image
          src={beforeUrl}
          alt={beforeAlt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          draggable={false}
        />
      </div>

      {/* Divisor: mismo `left` y -translate-x-1/2 que el mango para compartir eje exacto */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-white shadow-[0_0_20px_rgba(0,0,0,0.25)]"
        style={splitStyle}
        aria-hidden
      />

      {/* Mango: envoltorio solo posiciona; el scale al pulsar va en un hijo para no pisar translate */}
      <div
        className={cn(
          "absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 touch-none",
          sliderLocked
            ? "pointer-events-none cursor-not-allowed opacity-40"
            : "pointer-events-auto cursor-ew-resize",
        )}
        style={splitStyle}
        aria-hidden={sliderLocked}
      >
        <motion.div
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 520, damping: 32 }}
          className="relative flex items-center justify-center"
        >
          <motion.span
            className="absolute inline-flex size-[3.25rem] rounded-full bg-white/25"
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.55, 0.2, 0.55],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <span className="relative flex size-14 items-center justify-center rounded-full border border-white/50 bg-white/95 text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.2)] ring-2 ring-white/80 backdrop-blur-sm">
            <ChevronLeft
              className="absolute left-1 size-4 text-foreground/50"
              strokeWidth={2.5}
              aria-hidden
            />
            <ChevronRight
              className="absolute right-1 size-4 text-foreground/50"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="h-6 w-px rounded-full bg-foreground/20" aria-hidden />
          </span>
          <span className="sr-only">
            Arrastra para comparar antes y después
          </span>
        </motion.div>
      </div>

      <span className="pointer-events-none absolute left-4 top-4 z-[1] max-w-[45%] rounded-full bg-black/45 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-md sm:text-xs sm:normal-case sm:tracking-normal">
        {beforeBadgeLabel}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 z-[1] max-w-[52%] rounded-full bg-black/45 px-3 py-1 text-right text-[10px] font-medium leading-tight text-white backdrop-blur-md sm:text-xs">
        {afterBadgeLabel}
      </span>

      {shopPins?.length ? (
        <ShopTheLookMarkers
          pins={shopPins}
          variant="full"
          clipLeftPct={pct}
          className="z-[25]"
          onSlideInteractionLockChange={setSliderLocked}
        />
      ) : null}
    </div>
  );
}
