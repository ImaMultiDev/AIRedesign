"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShopOfferCard } from "@/components/landing/shop-offer-card";
import type { ShopPinPublic } from "@/types/showcase";
import { cn } from "@/lib/utils";

type Props = {
  pins: ShopPinPublic[];
  /** Coordenadas relativas al ancho total del comparador (igual que al crear pins en admin). */
  variant: "full" | "afterHalf";
  className?: string;
  /**
   * Recorte por la izquierda en % (0–100): solo se pintan pins en la franja «Propuesta de IA»
   * (a la derecha del divisor del comparador). En tarjetas estáticas no se usa.
   */
  clipLeftPct?: number;
  /** Bloquea arrastre del comparador mientras el diálogo de ofertas está abierto */
  onSlideInteractionLockChange?: (locked: boolean) => void;
};

export function ShopTheLookMarkers({
  pins,
  variant,
  className,
  clipLeftPct,
  onSlideInteractionLockChange,
}: Props) {
  const [detail, setDetail] = useState<ShopPinPublic | null>(null);

  const detailOpen = detail !== null;

  useEffect(() => {
    onSlideInteractionLockChange?.(detailOpen);
  }, [detailOpen, onSlideInteractionLockChange]);

  useEffect(() => {
    return () => {
      onSlideInteractionLockChange?.(false);
    };
  }, [onSlideInteractionLockChange]);

  if (!pins?.length) return null;

  function onMarkerActivate(pin: ShopPinPublic) {
    setDetail(pin);
  }

  const offers = detail?.offers ?? [];

  const effectiveClipLeft =
    clipLeftPct ?? (variant === "afterHalf" ? 50 : undefined);

  const markerLayer = (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[8]",
        className,
      )}
      style={
        effectiveClipLeft != null
          ? { clipPath: `inset(0 0 0 ${effectiveClipLeft}%)` }
          : undefined
      }
      aria-hidden={false}
    >
      {pins.map((pin, i) => (
        <motion.button
          key={pin.id}
          type="button"
          data-shop-pin
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 28,
            delay: i * 0.04,
          }}
          className="pointer-events-auto absolute z-[9] flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/25 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            left: `${pin.positionX * 100}%`,
            top: `${pin.positionY * 100}%`,
          }}
          aria-label={`Ver comparativa de tiendas · ${pin.name || `Producto ${i + 1}`}`}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onMarkerActivate(pin);
          }}
        >
          <span className="text-xs font-semibold tabular-nums">{i + 1}</span>
        </motion.button>
      ))}
    </div>
  );

  return (
    <>
      {markerLayer}

      <Dialog
        open={detailOpen}
        onOpenChange={(o) => {
          if (!o) setDetail(null);
        }}
      >
        <DialogContent
          showCloseButton
          overlayClassName="z-[220] bg-black/55 supports-backdrop-filter:backdrop-blur-sm"
          className="z-[230] max-h-[min(88dvh,640px)] max-w-md gap-0 overflow-hidden rounded-2xl border-foreground/10 bg-background p-0"
        >
          <DialogHeader className="space-y-1 border-b border-foreground/10 px-5 py-4 text-left">
            <DialogTitle className="font-heading text-lg leading-snug tracking-tight sm:text-xl">
              {detail?.name}
            </DialogTitle>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Comparativa por precio con identidad de cada distribuidor. Los
              enlaces abren la tienda en una pestaña nueva.
            </p>
          </DialogHeader>
          <div className="max-h-[min(58vh,420px)] overflow-y-auto px-4 py-4">
            <ul className="list-none space-y-3 p-0">
              {offers.map((o) => (
                <ShopOfferCard
                  key={o.id}
                  offer={o}
                  productName={detail?.name?.trim() || "Producto"}
                />
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
