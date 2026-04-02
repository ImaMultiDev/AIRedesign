"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CheckoutPlusButton } from "@/components/billing/checkout-plus-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col border-t border-foreground/[0.06]">
        <section className="mx-auto max-w-5xl px-6 py-24 lg:px-8">
          <div className="mb-16 max-w-2xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Membresía
            </p>
            <h1 className="font-heading text-4xl tracking-tight text-foreground md:text-5xl">
              Elige cómo quieres transformar tu espacio
            </h1>
            <p className="text-lg text-muted-foreground">
              Galería pública, propuestas básicas para descubrir el estilo, y
              Plus para llevar tu proyecto a obra con cifras, materiales y ficha
              técnica.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
            <div className="flex flex-col rounded-3xl border border-foreground/10 bg-card p-8 shadow-sm ring-1 ring-foreground/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Gratis
              </p>
              <p className="mt-3 font-heading text-3xl tracking-tight text-card-foreground">
                Explora
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Inspiración y primera toma de contacto con el equipo.
              </p>
              <ul className="mt-8 flex flex-1 flex-col gap-4 text-sm text-card-foreground">
                {[
                  "Galería antes / después",
                  "Solicitud de propuesta visual básica",
                  "Resumen orientativo por el equipo",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xs text-muted-foreground">
                Sin presupuesto detallado ni descarga de ficha PDF.
              </p>
              <Link
                href="/login?callbackUrl=%2Fcuenta%2Fsolicitud"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 h-11 w-full rounded-full border-foreground/15",
                )}
              >
                Crear cuenta gratis
              </Link>
            </div>

            <div className="relative flex flex-col overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.09] via-card to-card p-8 shadow-xl shadow-primary/[0.08] ring-1 ring-primary/15">
              <div
                className="pointer-events-none absolute -right-16 top-0 size-48 rounded-full bg-primary/20 blur-3xl"
                aria-hidden
              />
              <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Plus
              </p>
              <p className="relative mt-3 font-heading text-3xl tracking-tight text-card-foreground">
                Proyecto completo
              </p>
              <p className="relative mt-2 text-sm text-muted-foreground">
                Para quien ya visualiza el resultado y necesita números y
                documentación.
              </p>
              <ul className="relative mt-8 flex flex-1 flex-col gap-4 text-sm text-card-foreground">
                {[
                  "Todo lo del plan gratuito",
                  "Propuesta visual completa con rediseño IA",
                  "Presupuesto de materiales detallado",
                  "Ficha técnica profesional en PDF",
                  "Prioridad en la cola del equipo",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
              <CheckoutPlusButton className="relative mt-8 h-11 w-full rounded-full shadow-lg shadow-primary/25">
                PLUS - 14.99€/mes
              </CheckoutPlusButton>
              <p className="relative mt-4 text-center text-[11px] text-muted-foreground">
                Pago seguro · cancela cuando quieras desde tu cuenta
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
