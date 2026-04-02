"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  beforeUrl: string;
  afterUrl: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
};

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeAlt = "Antes",
  afterAlt = "Después",
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPct(rect.width === 0 ? 50 : (x / rect.width) * 100);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative aspect-[4/3] w-full max-h-[min(85vh,56rem)] touch-none select-none overflow-hidden rounded-2xl bg-muted shadow-2xl ring-1 ring-black/5",
        className,
      )}
      onPointerDown={(e) => {
        dragging.current = true;
        wrapRef.current?.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        setFromClientX(e.clientX);
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

      <motion.div
        className="pointer-events-none absolute bottom-0 top-0 w-px bg-white/95 shadow-[0_0_24px_rgba(0,0,0,0.35)]"
        style={{ left: `${pct}%`, x: "-50%" }}
        layout={false}
      >
        <motion.div
          className="pointer-events-auto absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-white/40 bg-white/95 text-foreground shadow-xl backdrop-blur-sm"
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          <GripVertical className="size-6 opacity-70" aria-hidden />
          <span className="sr-only">Arrastra para comparar antes y después</span>
        </motion.div>
      </motion.div>

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
        Antes
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
        Después
      </span>
    </div>
  );
}
