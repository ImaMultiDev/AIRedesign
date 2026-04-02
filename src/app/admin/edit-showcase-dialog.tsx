"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { uploadImageWithProgress } from "@/lib/upload-with-progress";
import type { AdminShowcaseRow } from "@/types/admin-showcase";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AdminShowcaseRow | null;
  onSaved: (row: AdminShowcaseRow) => void;
};

export function EditShowcaseDialog({
  open,
  onOpenChange,
  item,
  onSaved,
}: Props) {
  const formId = useId();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [progressBefore, setProgressBefore] = useState<number | null>(null);
  const [progressAfter, setProgressAfter] = useState<number | null>(null);
  const [beforePreviewUrl, setBeforePreviewUrl] = useState<string | null>(
    null,
  );
  const [afterPreviewUrl, setAfterPreviewUrl] = useState<string | null>(null);
  const [galleryPlusBudget, setGalleryPlusBudget] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [clearPdf, setClearPdf] = useState(false);

  useEffect(() => {
    if (!beforeFile) {
      setBeforePreviewUrl(null);
      return;
    }
    const u = URL.createObjectURL(beforeFile);
    setBeforePreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [beforeFile]);

  useEffect(() => {
    if (!afterFile) {
      setAfterPreviewUrl(null);
      return;
    }
    const u = URL.createObjectURL(afterFile);
    setAfterPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [afterFile]);

  useEffect(() => {
    if (item && open) {
      setTitle(item.title);
      setCategory(item.category);
      setDescription(item.description ?? "");
      setBeforeFile(null);
      setAfterFile(null);
      setProgressBefore(null);
      setProgressAfter(null);
      setGalleryPlusBudget(item.plusBudgetDetails ?? "");
      setPdfFile(null);
      setClearPdf(false);
    }
  }, [item, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    if (!title.trim() || !category.trim()) {
      toast.error("Título y categoría son obligatorios.");
      return;
    }

    setSaving(true);
    setProgressBefore(null);
    setProgressAfter(null);

    try {
      let beforeUrl = item.beforeUrl;
      let afterUrl = item.afterUrl;
      let beforePublicId = item.beforePublicId;
      let afterPublicId = item.afterPublicId;

      if (beforeFile) {
        setProgressBefore(0);
        const up = await uploadImageWithProgress(beforeFile, (p) =>
          setProgressBefore(p),
        );
        beforeUrl = up.url;
        beforePublicId = up.publicId;
        setProgressBefore(100);
      }

      if (afterFile) {
        setProgressAfter(0);
        const up = await uploadImageWithProgress(afterFile, (p) =>
          setProgressAfter(p),
        );
        afterUrl = up.url;
        afterPublicId = up.publicId;
        setProgressAfter(100);
      }

      const patchBody: Record<string, unknown> = {
        title: title.trim(),
        category: category.trim(),
        description: description.trim() || null,
        plusBudgetDetails: galleryPlusBudget.trim() || null,
      };

      if (clearPdf) {
        patchBody.technicalPdfUrl = null;
        patchBody.technicalPdfPublicId = null;
      } else if (pdfFile) {
        const fd = new FormData();
        fd.set("file", pdfFile);
        const upPdf = await fetch("/api/upload/pdf", {
          method: "POST",
          body: fd,
        });
        const pdfData = await upPdf.json().catch(() => ({}));
        if (!upPdf.ok) {
          throw new Error(
            typeof pdfData.error === "string"
              ? pdfData.error
              : "Error subiendo el PDF",
          );
        }
        patchBody.technicalPdfUrl = pdfData.url;
        patchBody.technicalPdfPublicId = pdfData.publicId;
      }

      if (beforeFile) {
        patchBody.beforeUrl = beforeUrl;
        patchBody.beforePublicId = beforePublicId;
      }
      if (afterFile) {
        patchBody.afterUrl = afterUrl;
        patchBody.afterPublicId = afterPublicId;
      }

      const res = await fetch(`/api/showcase/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "No se guardó",
        );
      }

      onSaved({
        id: data.id,
        title: data.title,
        category: data.category,
        description: data.description,
        beforeUrl: data.beforeUrl,
        afterUrl: data.afterUrl,
        beforePublicId: data.beforePublicId ?? null,
        afterPublicId: data.afterPublicId ?? null,
        plusBudgetDetails: data.plusBudgetDetails ?? null,
        technicalPdfUrl: data.technicalPdfUrl ?? null,
        technicalPdfPublicId: data.technicalPdfPublicId ?? null,
        isActive: data.isActive ?? item.isActive,
      });

      toast.success("Cambios guardados");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
      setProgressBefore(null);
      setProgressAfter(null);
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,860px)] max-w-lg gap-0 overflow-y-auto rounded-2xl border-foreground/10 p-0 shadow-2xl sm:max-w-xl">
        <DialogHeader className="border-b border-foreground/10 px-6 py-5 text-left">
          <DialogTitle className="font-heading text-xl tracking-tight">
            Editar ejemplo
          </DialogTitle>
          <DialogDescription>
            Modifica textos o sustituye imágenes. Si no eliges archivo nuevo, se
            conserva la foto actual.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="space-y-5 px-6 py-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-title`}>Título</Label>
              <Input
                id={`${formId}-title`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl bg-muted/40"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-cat`}>Categoría</Label>
              <Input
                id={`${formId}-cat`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 rounded-xl bg-muted/40"
                disabled={saving}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-desc`}>Descripción</Label>
            <Textarea
              id={`${formId}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl bg-muted/40"
              disabled={saving}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
            <Label className="text-xs uppercase tracking-wider text-primary">
              Galería · contenido Plus
            </Label>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-plus-budget`}>
                Presupuesto detallado
              </Label>
              <Textarea
                id={`${formId}-plus-budget`}
                value={galleryPlusBudget}
                onChange={(e) => setGalleryPlusBudget(e.target.value)}
                rows={4}
                className="rounded-xl bg-background"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-pdf`}>Ficha técnica PDF</Label>
              {item.technicalPdfUrl && !clearPdf ? (
                <p className="text-xs text-muted-foreground">
                  <a
                    href={item.technicalPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Ver PDF actual
                  </a>
                  {" · "}
                  <button
                    type="button"
                    className="text-destructive underline-offset-4 hover:underline"
                    disabled={saving}
                    onClick={() => {
                      setClearPdf(true);
                      setPdfFile(null);
                    }}
                  >
                    Quitar
                  </button>
                </p>
              ) : null}
              {(clearPdf || !item.technicalPdfUrl) && (
                <Input
                  id={`${formId}-pdf`}
                  type="file"
                  accept="application/pdf"
                  disabled={saving}
                  className="h-auto min-h-[2.75rem] cursor-pointer rounded-lg border border-dashed border-foreground/10 bg-background py-2 text-sm"
                  onChange={(e) => {
                    setPdfFile(e.target.files?.[0] ?? null);
                    if (e.target.files?.[0]) setClearPdf(false);
                  }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="min-w-0 space-y-3 rounded-xl border border-foreground/10 bg-muted/20 p-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Imagen antes
              </Label>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={beforePreviewUrl ?? item.beforeUrl}
                  alt="Vista antes"
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized={!!beforePreviewUrl}
                />
              </div>
              <Input
                type="file"
                accept="image/*"
                disabled={saving}
                className="h-auto min-h-[3.25rem] w-full cursor-pointer rounded-lg border border-dashed border-foreground/10 bg-background/80 py-2 pl-2 pr-2 text-sm leading-normal file:mr-3 file:inline-flex file:h-10 file:shrink-0 file:items-center file:justify-center file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                onChange={(e) => setBeforeFile(e.target.files?.[0] ?? null)}
              />
              {progressBefore !== null ? (
                <div className="space-y-1">
                  <Progress value={progressBefore} className="w-full" />
                  <p className="text-[11px] tabular-nums text-muted-foreground">
                    Subiendo antes… {progressBefore}%
                  </p>
                </div>
              ) : null}
            </div>
            <div className="min-w-0 space-y-3 rounded-xl border border-foreground/10 bg-muted/20 p-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Imagen después
              </Label>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={afterPreviewUrl ?? item.afterUrl}
                  alt="Vista después"
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized={!!afterPreviewUrl}
                />
              </div>
              <Input
                type="file"
                accept="image/*"
                disabled={saving}
                className="h-auto min-h-[3.25rem] w-full cursor-pointer rounded-lg border border-dashed border-foreground/10 bg-background/80 py-2 pl-2 pr-2 text-sm leading-normal file:mr-3 file:inline-flex file:h-10 file:shrink-0 file:items-center file:justify-center file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                onChange={(e) => setAfterFile(e.target.files?.[0] ?? null)}
              />
              {progressAfter !== null ? (
                <div className="space-y-1">
                  <Progress value={progressAfter} className="w-full" />
                  <p className="text-[11px] tabular-nums text-muted-foreground">
                    Subiendo después… {progressAfter}%
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-foreground/10 pt-5">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
