"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SubscriptionRefresh } from "@/components/billing/subscription-refresh";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ProposalRow = {
  id: string;
  title: string | null;
  description: string;
  tierRequested: string;
  status: string;
  createdAt: string;
};

const statusLabel: Record<string, string> = {
  SUBMITTED: "Recibida",
  IN_REVIEW: "En revisión",
  BASIC_READY: "Propuesta básica lista",
  PLUS_IN_PROGRESS: "Plus en curso",
  PLUS_DELIVERED: "Entregada",
  ARCHIVED: "Archivada",
};

export function CuentaHomeClient() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ProposalRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const isPlus = session?.user?.isPlus ?? false;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/proposals");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Error");
        if (!cancelled) setItems(data.items ?? []);
      } catch {
        if (!cancelled) toast.error("No se pudieron cargar las solicitudes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const subLabel = useMemo(() => {
    const s = session?.user?.subscriptionStatus;
    if (isPlus) return "Plus activo";
    if (s === "CANCELED" || s === "PAST_DUE") return "Suscripción inactiva";
    return "Plan gratuito";
  }, [isPlus, session?.user?.subscriptionStatus]);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          typeof data.error === "string" ? data.error : "No disponible",
        );
      const url = data.url as string | undefined;
      if (url) window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setPortalLoading(false);
    }
  }

  return (
    <>
      <Suspense fallback={null}>
        <SubscriptionRefresh />
      </Suspense>

      <div className="space-y-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Área personal
          </p>
          <h1 className="mt-2 font-heading text-3xl tracking-tight text-foreground md:text-4xl">
            Hola{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Gestiona tus solicitudes y tu suscripción Plus desde un único lugar.
          </p>
        </div>

        <Card className="overflow-hidden rounded-2xl border-foreground/10 bg-card shadow-sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-foreground/10 bg-muted/25">
            <div>
              <CardTitle className="font-heading text-lg font-normal">
                Membresía
              </CardTitle>
              <p className="text-sm text-muted-foreground">{subLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isPlus ? (
                <>
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-primary/20 bg-primary/10 text-primary"
                  >
                    Plus
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={portalLoading}
                    onClick={openPortal}
                  >
                    {portalLoading ? "Abriendo…" : "Facturación Stripe"}
                  </Button>
                </>
              ) : (
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-full",
                  )}
                >
                  Ver plan Plus
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {session?.user?.subscriptionCurrentPeriodEnd && isPlus ? (
              <p>
                Próxima renovación aproximada:{" "}
                <span className="text-foreground">
                  {new Date(
                    session.user.subscriptionCurrentPeriodEnd,
                  ).toLocaleDateString("es")}
                </span>
                . Los cargos los gestiona Stripe con cifrado punta a punta.
              </p>
            ) : (
              <p>
                El plan gratuito incluye la galería y propuestas básicas. Plus
                añade presupuesto detallado, ficha PDF y prioridad creativa.
              </p>
            )}
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-heading text-xl tracking-tight text-foreground">
              Tus solicitudes
            </h2>
            <Link
              href="/cuenta/solicitud"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
            >
              Nueva solicitud
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-8 animate-spin text-primary/60" />
            </div>
          ) : !items?.length ? (
            <p className="rounded-2xl border border-dashed border-foreground/15 bg-muted/20 py-14 text-center text-sm text-muted-foreground">
              Aún no has creado ninguna solicitud.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/cuenta/solicitudes/${p.id}`}
                    className="block rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-card-foreground">
                          {p.title?.trim() || "Sin título"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs">
                        <Badge variant="outline" className="rounded-full">
                          {p.tierRequested === "PLUS" ? "Plus" : "Básica"}
                        </Badge>
                        <span className="text-muted-foreground">
                          {statusLabel[p.status] ?? p.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
