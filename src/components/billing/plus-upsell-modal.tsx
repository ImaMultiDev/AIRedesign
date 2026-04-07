"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, FileText, PieChart, Crown } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: () => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
};

export function PlusUpsellModal({
  open,
  onOpenChange,
  onSubscribe,
  loading,
  title = "AIRedesign Plus",
  subtitle = "Desbloquea el paquete completo pensado para proyectos reales.",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="z-[240] bg-black/70 supports-backdrop-filter:backdrop-blur-md"
        className={cn(
          "z-[250] max-w-lg overflow-hidden border-foreground/15 bg-background p-0 shadow-2xl sm:rounded-3xl",
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          Ventajas del plan Plus y llamada a suscribirse
        </DialogDescription>

        <div className="relative bg-background px-8 pb-8 pt-10 sm:px-10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/[0.18] blur-3xl"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                <Crown className="size-6 text-primary" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Plan Plus
                </p>
                <h2 className="font-heading text-2xl tracking-tight text-foreground">
                  {title}
                </h2>
              </div>
            </div>

            <p className="text-base leading-relaxed text-muted-foreground">
              {subtitle}
            </p>

            <ul className="space-y-4">
              {[
                {
                  icon: Sparkles,
                  t: "Propuesta visual completa",
                  d: "Rediseño IA con narrativa lista para presentar.",
                },
                {
                  icon: PieChart,
                  t: "Presupuesto de materiales",
                  d: "Cifras detalladas y capas de inversión concretas.",
                },
                {
                  icon: FileText,
                  t: "Ficha técnica en PDF",
                  d: "Documento descargable para obra o proveedores.",
                },
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-background/80 ring-1 ring-foreground/10">
                    <Icon className="size-4 text-primary" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{t}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {d}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-muted-foreground"
                onClick={() => onOpenChange(false)}
              >
                Ahora no
              </Button>
              <Button
                type="button"
                className="rounded-full px-8 shadow-lg shadow-primary/20"
                disabled={loading}
                onClick={onSubscribe}
              >
                {loading ? "Abriendo pago…" : "Suscribirme a Plus"}
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
