"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PlusUpsellModal } from "@/components/billing/plus-upsell-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState<"BASIC" | "PLUS">("BASIC");
  const [saving, setSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const isPlus = session?.user?.isPlus ?? false;

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
      toast.error(e instanceof Error ? e.message : "No se pudo abrir Stripe");
      setCheckoutLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tier === "PLUS" && !isPlus) {
      setUpsellOpen(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          description: description.trim(),
          tierRequested: tier,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setUpsellOpen(true);
        setSaving(false);
        return;
      }
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "No se guardó",
        );
      }
      toast.success("Solicitud enviada");
      router.push(`/cuenta/solicitudes/${data.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/cuenta"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Volver al panel
        </Link>
      </div>

      <Card className="rounded-2xl border-foreground/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-normal tracking-tight">
            Nueva solicitud
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cuéntanos el espacio, referencias y sensaciones. El equipo revisa
            cada mensaje a mano.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-8">
            <div className="space-y-3">
              <Label>Nivel de entrega</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setTier("BASIC")}
                  className={cn(
                    "rounded-2xl border p-4 text-left text-sm transition-all",
                    tier === "BASIC"
                      ? "border-primary bg-primary/[0.06] ring-1 ring-primary/25"
                      : "border-foreground/10 bg-card hover:border-foreground/20",
                  )}
                >
                  <p className="font-medium text-foreground">Básica · gratis</p>
                  <p className="mt-1 text-muted-foreground">
                    Propuesta visual resumida y orientación del estudio.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTier("PLUS")}
                  className={cn(
                    "rounded-2xl border p-4 text-left text-sm transition-all",
                    tier === "PLUS"
                      ? "border-primary bg-primary/[0.06] ring-1 ring-primary/25"
                      : "border-foreground/10 bg-card hover:border-foreground/20",
                  )}
                >
                  <p className="font-medium text-foreground">Plus · completa</p>
                  <p className="mt-1 text-muted-foreground">
                    IA completa, presupuesto de materiales y ficha PDF.
                  </p>
                  {!isPlus ? (
                    <p className="mt-2 text-xs text-primary">Requiere suscripción activa</p>
                  ) : null}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sol-title">Título (opcional)</Label>
              <Input
                id="sol-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Reforma salón norte"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sol-desc">Describe tu proyecto</Label>
              <Textarea
                id="sol-desc"
                required
                minLength={8}
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Metros, luz natural, estilo deseado, mobiliario a conservar…"
                className="min-h-[140px] resize-y"
              />
            </div>
            <Button
              type="submit"
              className="h-11 rounded-full px-10"
              disabled={saving}
            >
              {saving ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <PlusUpsellModal
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        onSubscribe={startCheckout}
        loading={checkoutLoading}
        subtitle="Para solicitar entrega Plus necesitas una suscripción activa. Es el modo más completo para ejecutar tu idea con números y documentación."
      />
    </>
  );
}
