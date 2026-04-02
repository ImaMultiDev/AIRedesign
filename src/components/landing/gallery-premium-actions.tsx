"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ShowcaseItem } from "@/types/showcase";
import { PlusUpsellModal } from "@/components/billing/plus-upsell-modal";
import { FileDown, Lock, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  item: ShowcaseItem;
  /** compact = tarjeta; roomy = modal pantalla completa */
  variant?: "card" | "modal";
  className?: string;
};

export function GalleryPremiumActions({
  item,
  variant = "card",
  className,
}: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isPlus =
    status === "authenticated" &&
    session?.user?.role === "USER" &&
    session.user.isPlus;
  const showPremium =
    item.hasPremiumPdf || item.hasPremiumBudget;
  if (!showPremium) return null;

  const locked = status === "unauthenticated" || !isPlus;

  async function startCheckout() {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=%2F%23galeria");
      setUpsellOpen(false);
      return;
    }
    if (session?.user?.role !== "USER") {
      router.push("/login?callbackUrl=%2F%23galeria");
      setUpsellOpen(false);
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Error de pago",
        );
      }
      const url = data.url as string | undefined;
      if (url) window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Stripe no disponible");
      setCheckoutLoading(false);
    }
  }

  function onPdfClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!item.hasPremiumPdf) return;
    if (locked) {
      setUpsellOpen(true);
      return;
    }
    window.location.href = `/api/showcase/${item.id}/ficha-pdf`;
  }

  function onBudgetClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!item.hasPremiumBudget) return;
    if (locked) {
      setUpsellOpen(true);
      return;
    }
    if (item.plusBudgetDetails?.trim()) {
      setBudgetOpen(true);
    } else {
      toast.message("Contenido en preparación", {
        description: "El equipo aún está afinando el presupuesto de este ejemplo.",
      });
    }
  }

  const btnSize = variant === "modal" ? "default" : "sm";
  const btnClass = cn(
    "rounded-full gap-1.5 border-foreground/12",
    variant === "card" && "text-xs",
    locked && "border-dashed",
  );

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap gap-2",
          variant === "card" && "px-5 pb-5 pt-0",
          variant === "modal" && "w-full max-w-2xl justify-center sm:justify-start",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
        role="group"
        aria-label="Contenido exclusivo Plus"
      >
        {item.hasPremiumPdf ? (
          <Button
            type="button"
            variant="outline"
            size={btnSize}
            className={btnClass}
            onClick={onPdfClick}
          >
            {locked ? (
              <Lock className="size-3.5 shrink-0 opacity-70" aria-hidden />
            ) : (
              <FileDown className="size-3.5 shrink-0" aria-hidden />
            )}
            Descargar ficha técnica
          </Button>
        ) : null}
        {item.hasPremiumBudget ? (
          <Button
            type="button"
            variant="outline"
            size={btnSize}
            className={btnClass}
            onClick={onBudgetClick}
          >
            {locked ? (
              <Lock className="size-3.5 shrink-0 opacity-70" aria-hidden />
            ) : (
              <ScrollText className="size-3.5 shrink-0" aria-hidden />
            )}
            Ver presupuesto
          </Button>
        ) : null}
      </div>

      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="max-h-[min(85dvh,640px)] max-w-lg overflow-y-auto rounded-2xl border-foreground/10 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl tracking-tight">
              Presupuesto · {item.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detalle de materiales e inversión para suscriptores Plus
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {item.plusBudgetDetails}
          </div>
        </DialogContent>
      </Dialog>

      <PlusUpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        onSubscribe={startCheckout}
        loading={checkoutLoading}
        title="Contenido de estudio Plus"
        subtitle="La ficha técnica en PDF y el desglose de presupuesto de cada proyecto son parte del plan Plus. Suscríbete para descargarlos y ver cifras reales de materiales."
      />
    </>
  );
}
