"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BeforeAfterSlider } from "@/components/landing/before-after-slider";
import { motion } from "framer-motion";
import type { ShowcaseItem } from "@/types/showcase";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { PlusUpsellModal } from "@/components/billing/plus-upsell-modal";
import { GalleryPremiumActions } from "@/components/landing/gallery-premium-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ShowcaseItem | null;
};

export function ShowcaseModal({ open, onOpenChange, item }: Props) {
  const { data: session } = useSession();
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const isPlus =
    session?.user?.role === "USER" && Boolean(session.user.isPlus);

  if (!item) return null;

  async function startCheckout() {
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

  function onPlusMaterialsClick() {
    if (isPlus) {
      const dest =
        session?.user?.role === "USER"
          ? "/cuenta/solicitud"
          : "/login?callbackUrl=%2Fcuenta%2Fsolicitud";
      window.location.href = dest;
      return;
    }
    setUpsellOpen(true);
  }

  const solicitudHref =
    session?.user?.role === "USER"
      ? "/cuenta/solicitud"
      : "/login?callbackUrl=%2Fcuenta%2Fsolicitud";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton
          className="fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-none w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-background p-0 text-foreground shadow-none ring-0 sm:max-w-none [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5"
        >
          <DialogTitle className="sr-only">{item.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Comparador antes y después para {item.title}
          </DialogDescription>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-4 pb-10 pt-20 sm:px-8 lg:px-12"
          >
            <header className="mx-auto max-w-4xl space-y-3 text-center">
              <Badge
                variant="secondary"
                className="rounded-full border border-foreground/10 bg-background px-4 py-1 text-xs font-normal tracking-wide text-muted-foreground"
              >
                {item.category}
              </Badge>
              <h2 className="font-heading text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {item.title}
              </h2>
              {item.description ? (
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {item.description}
                </p>
              ) : null}
            </header>

            <div className="mx-auto w-full max-w-5xl flex-1">
              <BeforeAfterSlider
                beforeUrl={item.beforeUrl}
                afterUrl={item.afterUrl}
                beforeAlt={`Antes — ${item.title}`}
                afterAlt={`Propuesta de IA — ${item.title}`}
                afterBadgeLabel="Propuesta de IA"
                shopPins={item.shopPins}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Arrastra el control central para comparar.
            </p>

            <GalleryPremiumActions item={item} variant="modal" className="mx-auto" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-foreground/10 bg-muted/20 p-6 shadow-inner sm:flex-row sm:items-center sm:justify-between">
              <div className="text-left text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  ¿Quieres este nivel en tu espacio?
                </p>
                <p className="mt-1">
                  Propuesta básica sin coste, o Plus con presupuesto y PDF.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <Link
                  href={solicitudHref}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "w-full rounded-full sm:w-auto",
                  )}
                >
                  Pedir propuesta básica
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full border-primary/25 sm:w-auto"
                  onClick={onPlusMaterialsClick}
                >
                  {isPlus
                    ? "Nueva solicitud Plus"
                    : "Presupuesto + ficha PDF"}
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <PlusUpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        onSubscribe={startCheckout}
        loading={checkoutLoading}
        title="Lleva esta calidad a tu obra"
        subtitle="El plan Plus incluye el rediseño completo, el presupuesto de materiales y la ficha técnica lista para compartir con proveedores."
      />
    </>
  );
}
