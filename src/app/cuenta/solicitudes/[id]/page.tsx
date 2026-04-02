"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PlusUpsellModal } from "@/components/billing/plus-upsell-modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileDown, Loader2 } from "lucide-react";

type ProposalDetail = {
  id: string;
  title: string | null;
  description: string;
  tierRequested: string;
  status: string;
  basicSummary: string | null;
  plusBudgetDetails: string | null;
  technicalPdfUrl: string | null;
  plusAssetsHeld?: boolean;
  createdAt: string;
};

export default function SolicitudDetallePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: session } = useSession();
  const [row, setRow] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isPlus = session?.user?.isPlus ?? false;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/proposals/${id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Error");
        if (!cancelled) setRow(data as ProposalDetail);
      } catch {
        if (!cancelled) {
          setRow(null);
          toast.error("No se encontró la solicitud");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  function openPdf() {
    if (!row?.technicalPdfUrl) return;
    window.open(row.technicalPdfUrl, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary/60" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">No encontramos esta solicitud.</p>
        <Link
          href="/cuenta"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          Volver
        </Link>
      </div>
    );
  }

  const showPlusSection =
    row.tierRequested === "PLUS" ||
    row.plusBudgetDetails ||
    row.technicalPdfUrl ||
    row.plusAssetsHeld;

  return (
    <>
      <div className="mb-8">
        <Link
          href="/cuenta"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Todas las solicitudes
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                {row.tierRequested === "PLUS" ? "Plus" : "Básica"}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                {row.status}
              </Badge>
            </div>
            <h1 className="mt-3 font-heading text-3xl tracking-tight text-foreground">
              {row.title?.trim() || "Solicitud"}
            </h1>
          </div>
          {!isPlus ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setUpsellOpen(true)}
            >
              Pasar a Plus
            </Button>
          ) : null}
        </div>

        <Card className="rounded-2xl border-foreground/10">
          <CardHeader>
            <CardTitle className="font-heading text-lg font-normal">
              Tu briefing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {row.description}
            </p>
          </CardContent>
        </Card>

        {row.basicSummary ? (
          <Card className="rounded-2xl border-foreground/10">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-normal">
                Propuesta básica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {row.basicSummary}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {showPlusSection ? (
          <Card className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.04] to-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-normal">
                Entrega Plus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {row.plusAssetsHeld ? (
                <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.04] p-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    Tu paquete Plus está listo
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Activa Plus para ver el presupuesto de materiales y la ficha
                    PDF profesional.
                  </p>
                  <Button
                    type="button"
                    className="mt-5 rounded-full"
                    onClick={() => setUpsellOpen(true)}
                  >
                    Desbloquear con Plus
                  </Button>
                </div>
              ) : null}

              {row.plusBudgetDetails ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Presupuesto materiales
                  </p>
                  <div className="mt-2 whitespace-pre-wrap rounded-xl border border-foreground/10 bg-background/60 p-4 text-sm text-muted-foreground">
                    {row.plusBudgetDetails}
                  </div>
                </div>
              ) : row.tierRequested === "PLUS" && !row.plusAssetsHeld ? (
                <p className="text-sm text-muted-foreground">
                  Estamos preparando el presupuesto detallado de materiales.
                </p>
              ) : null}

              {row.technicalPdfUrl ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Ficha técnica
                  </p>
                  <Button
                    type="button"
                    className="mt-3 rounded-full gap-2"
                    onClick={openPdf}
                  >
                    <FileDown className="size-4" />
                    Descargar PDF
                  </Button>
                </div>
              ) : row.tierRequested === "PLUS" && !row.plusAssetsHeld ? (
                <p className="text-sm text-muted-foreground">
                  Generaremos la ficha PDF cuando el proyecto esté listo.
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <PlusUpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        onSubscribe={startCheckout}
        loading={checkoutLoading}
      />
    </>
  );
}
