"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

type Row = {
  id: string;
  title: string | null;
  description: string;
  tierRequested: string;
  status: string;
  basicSummary: string | null;
  plusBudgetDetails: string | null;
  technicalPdfUrl: string | null;
  technicalPdfPublicId: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string | null; subscriptionStatus: string };
};

const STATUS_OPTIONS = [
  "SUBMITTED",
  "IN_REVIEW",
  "BASIC_READY",
  "PLUS_IN_PROGRESS",
  "PLUS_DELIVERED",
  "ARCHIVED",
] as const;

export function AdminProposalsClient() {
  const router = useRouter();
  const [items, setItems] = useState<Row[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pdfUploadId, setPdfUploadId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/proposals");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Error");
        if (!cancelled) setItems(data.items ?? []);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "No se pudo cargar");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function patchRow(
    id: string,
    payload: Record<string, unknown>,
  ) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "No guardado",
        );
      }
      setItems((prev) =>
        prev?.map((r) =>
          r.id === id
            ? {
                ...r,
                ...payload,
                technicalPdfUrl:
                  (payload.technicalPdfUrl as string | null | undefined) ??
                  r.technicalPdfUrl,
                technicalPdfPublicId:
                  (payload.technicalPdfPublicId as string | null | undefined) ??
                  r.technicalPdfPublicId,
                plusBudgetDetails:
                  (payload.plusBudgetDetails as string | null | undefined) ??
                  r.plusBudgetDetails,
                basicSummary:
                  (payload.basicSummary as string | null | undefined) ??
                  r.basicSummary,
                status: (payload.status as string) ?? r.status,
              }
            : r,
        ) ?? null,
      );
      toast.success("Guardado");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingId(null);
    }
  }

  async function onPdfSelected(id: string, file: File | null) {
    if (!file) return;
    setPdfUploadId(id);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload/pdf", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Subida fallida",
        );
      }
      await patchRow(id, {
        technicalPdfUrl: data.url,
        technicalPdfPublicId: data.publicId,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF no subido");
    } finally {
      setPdfUploadId(null);
    }
  }

  if (!items) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[oklch(0.985_0.006_85)]">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 md:px-8">
        <header className="flex flex-col gap-6 border-b border-foreground/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Gestión interna
            </p>
            <h1 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl">
              Solicitudes
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground">
              Filtra por estado, responde con notas básicas o entregables Plus,
              y sube la ficha PDF (Cloudinary raw).
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl border-foreground/15 bg-background px-5",
              )}
            >
              Galería
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl border-foreground/15 bg-background px-5",
              )}
            >
              Ver sitio
            </Link>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-foreground/15 bg-background"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Cerrar sesión
            </Button>
          </div>
        </header>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-foreground/15 bg-muted/20 py-16 text-center text-sm text-muted-foreground">
            No hay solicitudes todavía.
          </p>
        ) : (
          <ul className="space-y-6">
            {items.map((r) => {
              const open = expanded === r.id;
              return (
                <li key={r.id}>
                  <Card className="overflow-hidden rounded-2xl border-foreground/10 bg-card shadow-sm">
                    <button
                      type="button"
                      className="flex w-full flex-col gap-2 px-6 py-5 text-left transition-colors hover:bg-muted/20 md:flex-row md:items-center md:justify-between"
                      onClick={() => setExpanded(open ? null : r.id)}
                    >
                      <div>
                        <p className="font-heading text-lg tracking-tight text-card-foreground">
                          {r.title?.trim() || "Sin título"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.user.email} · {r.tierRequested} · {r.user.subscriptionStatus}
                        </p>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-wider text-primary">
                        {open ? "Cerrar" : "Gestionar"}
                      </span>
                    </button>
                    {open ? (
                      <CardContent className="space-y-6 border-t border-foreground/10 bg-muted/15 px-6 py-6">
                        <div className="rounded-xl border border-foreground/10 bg-background/80 p-4 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">Briefing</p>
                          <p className="mt-2 whitespace-pre-wrap">{r.description}</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`status-${r.id}`}>Estado</Label>
                            <select
                              id={`status-${r.id}`}
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                              value={r.status}
                              disabled={savingId === r.id}
                              onChange={(e) =>
                                void patchRow(r.id, { status: e.target.value })
                              }
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Resumen propuesta básica</Label>
                            <Textarea
                              rows={4}
                              defaultValue={r.basicSummary ?? ""}
                              id={`basic-${r.id}`}
                              className="min-h-[100px] rounded-xl"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="rounded-full"
                              disabled={savingId === r.id}
                              onClick={() => {
                                const el = document.getElementById(
                                  `basic-${r.id}`,
                                ) as HTMLTextAreaElement | null;
                                void patchRow(r.id, {
                                  basicSummary: el?.value.trim() || null,
                                });
                              }}
                            >
                              Guardar básico
                            </Button>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Presupuesto Plus (materiales)</Label>
                            <Textarea
                              rows={6}
                              defaultValue={r.plusBudgetDetails ?? ""}
                              id={`plus-${r.id}`}
                              className="min-h-[120px] rounded-xl"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="rounded-full"
                              disabled={savingId === r.id}
                              onClick={() => {
                                const el = document.getElementById(
                                  `plus-${r.id}`,
                                ) as HTMLTextAreaElement | null;
                                void patchRow(r.id, {
                                  plusBudgetDetails: el?.value.trim() || null,
                                });
                              }}
                            >
                              Guardar Plus
                            </Button>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Ficha PDF (Cloudinary)</Label>
                            {r.technicalPdfUrl ? (
                              <p className="text-xs text-muted-foreground">
                                <a
                                  href={r.technicalPdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary underline-offset-4 hover:underline"
                                >
                                  Ver PDF actual
                                </a>
                              </p>
                            ) : null}
                            <InputPdf
                              disabled={pdfUploadId === r.id || savingId === r.id}
                              onChange={(f) => void onPdfSelected(r.id, f)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    ) : null}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function InputPdf({
  onChange,
  disabled,
}: {
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="file"
      accept="application/pdf"
      disabled={disabled}
      className="block w-full max-w-md text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
      onChange={(e) => onChange(e.target.files?.[0] ?? null)}
    />
  );
}
