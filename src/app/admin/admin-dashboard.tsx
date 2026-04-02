"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EditShowcaseDialog } from "@/app/admin/edit-showcase-dialog";
import { uploadImageWithProgress } from "@/lib/upload-with-progress";
import type { AdminShowcaseRow } from "@/types/admin-showcase";
import { Switch } from "@/components/ui/switch";
import { Loader2, PencilLine, Trash2 } from "lucide-react";

type Props = {
  initialItems: AdminShowcaseRow[];
};

export function AdminDashboard({ initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [progressBefore, setProgressBefore] = useState<number | null>(null);
  const [progressAfter, setProgressAfter] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminShowcaseRow | null>(null);

  function openEdit(row: AdminShowcaseRow) {
    setEditTarget(row);
    setEditOpen(true);
  }

  function mergeSaved(row: AdminShowcaseRow) {
    setItems((prev) => prev.map((x) => (x.id === row.id ? row : x)));
    router.refresh();
  }

  async function handleActiveChange(id: string, next: boolean) {
    const snapshot = items;
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, isActive: next } : x)),
    );
    try {
      const res = await fetch(`/api/showcase/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Error al actualizar",
        );
      }
      toast.success(
        next ? "Visible en la web pública" : "Oculto en la web pública",
      );
      router.refresh();
    } catch (err) {
      setItems(snapshot);
      toast.error(err instanceof Error ? err.message : "No se actualizó");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!beforeFile || !afterFile) {
      toast.error("Selecciona imagen «Antes» y «Después».");
      return;
    }
    if (!title.trim() || !category.trim()) {
      toast.error("Título y categoría son obligatorios.");
      return;
    }

    setSaving(true);
    setProgressBefore(null);
    setProgressAfter(null);

    try {
      setProgressBefore(0);
      const before = await uploadImageWithProgress(beforeFile, (p) =>
        setProgressBefore(p),
      );
      setProgressBefore(100);

      setProgressAfter(0);
      const after = await uploadImageWithProgress(afterFile, (p) =>
        setProgressAfter(p),
      );
      setProgressAfter(100);

      const res = await fetch("/api/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim(),
          description: description.trim() || null,
          beforeUrl: before.url,
          afterUrl: after.url,
          beforePublicId: before.publicId,
          afterPublicId: after.publicId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "No se guardó",
        );
      }

      const row: AdminShowcaseRow = {
        id: data.id,
        title: data.title,
        category: data.category,
        description: data.description ?? null,
        beforeUrl: data.beforeUrl,
        afterUrl: data.afterUrl,
        beforePublicId: data.beforePublicId ?? null,
        afterPublicId: data.afterPublicId ?? null,
        isActive: data.isActive ?? true,
      };
      setItems((prev) => [row, ...prev]);
      setTitle("");
      setCategory("");
      setDescription("");
      setBeforeFile(null);
      setAfterFile(null);
      toast.success("Ejemplo creado y subido a Cloudinary");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setSaving(false);
      setProgressBefore(null);
      setProgressAfter(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este ejemplo y sus imágenes en Cloudinary?")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/showcase/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : "No se pudo eliminar",
        );
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success("Eliminado de la base de datos y de Cloudinary");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[oklch(0.985_0.006_85)]">
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:px-8">
        <header className="flex flex-col gap-6 border-b border-foreground/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Gestión interna
            </p>
            <h1 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl">
              Escaparates
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Alta y edición de comparativas. Las subidas muestran progreso
              real; al borrar se limpian los activos en Cloudinary. El
              interruptor controla si el ejemplo se ve en la home.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl border-foreground/15 bg-background px-5",
              )}
            >
              Ver sitio público
            </Link>
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0 rounded-xl border-foreground/15 bg-background"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Cerrar sesión
            </Button>
          </div>
        </header>

        <Card className="overflow-hidden rounded-2xl border-foreground/10 bg-card shadow-sm">
          <CardHeader className="border-b border-foreground/10 bg-muted/30 px-6 py-5">
            <CardTitle className="font-heading text-lg font-normal tracking-tight">
              Nuevo ejemplo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Título</Label>
                  <Input
                    id="create-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 rounded-xl bg-background"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-category">Categoría</Label>
                  <Input
                    id="create-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 rounded-xl bg-background"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-desc">Descripción (opcional)</Label>
                <Textarea
                  id="create-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="rounded-xl bg-background"
                  disabled={saving}
                />
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="create-before">Foto antes</Label>
                  <Input
                    id="create-before"
                    type="file"
                    accept="image/*"
                    disabled={saving}
                    className="h-auto min-h-[3.5rem] w-full cursor-pointer rounded-xl border-dashed border-foreground/15 bg-muted/30 py-2.5 pl-3 pr-3 text-sm leading-normal file:mr-4 file:inline-flex file:h-11 file:shrink-0 file:items-center file:justify-center file:rounded-lg file:border-0 file:bg-primary file:px-5 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                    onChange={(e) => setBeforeFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="create-after">Foto después</Label>
                  <Input
                    id="create-after"
                    type="file"
                    accept="image/*"
                    disabled={saving}
                    className="h-auto min-h-[3.5rem] w-full cursor-pointer rounded-xl border-dashed border-foreground/15 bg-muted/30 py-2.5 pl-3 pr-3 text-sm leading-normal file:mr-4 file:inline-flex file:h-11 file:shrink-0 file:items-center file:justify-center file:rounded-lg file:border-0 file:bg-primary file:px-5 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                    onChange={(e) => setAfterFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              {(progressBefore !== null || progressAfter !== null) && (
                <div className="space-y-4 rounded-xl border border-foreground/10 bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subida a Cloudinary
                  </p>
                  {progressBefore !== null ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span>Imagen «antes»</span>
                        <span className="tabular-nums">{progressBefore}%</span>
                      </div>
                      <Progress value={progressBefore} className="w-full" />
                    </div>
                  ) : null}
                  {progressAfter !== null ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span>Imagen «después»</span>
                        <span className="tabular-nums">{progressAfter}%</span>
                      </div>
                      <Progress value={progressAfter} className="w-full" />
                    </div>
                  ) : null}
                </div>
              )}

              <Button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-xl px-8"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Procesando…
                  </>
                ) : (
                  "Subir y publicar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-heading text-2xl tracking-tight">
              Colección
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({items.length})
              </span>
            </h2>
          </div>

          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-foreground/15 bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
              Aún no hay registros en base de datos. La web pública puede
              mostrar datos mock hasta que crees el primero.
            </p>
          ) : (
            <ul className="grid gap-4">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="group flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center md:gap-6 md:p-5"
                >
                  <div className="relative mx-auto h-44 w-full max-w-md overflow-hidden rounded-xl bg-muted md:mx-0 md:h-28 md:w-44 md:max-w-none md:shrink-0">
                    {deletingId === row.id ? (
                      <Skeleton className="absolute inset-0 rounded-xl" />
                    ) : (
                      <Image
                        src={row.afterUrl}
                        alt={`${row.title} — miniatura`}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="200px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="font-medium leading-snug">{row.title}</p>
                    <p className="text-xs font-medium uppercase tracking-wider text-primary/90">
                      {row.category}
                    </p>
                    {row.description ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {row.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-3 self-stretch sm:flex-row sm:items-center sm:justify-end md:self-center">
                    <div className="flex items-center gap-2 border-t border-foreground/10 pt-3 sm:border-t-0 sm:pt-0">
                      <Switch
                        id={`active-${row.id}`}
                        checked={row.isActive}
                        onCheckedChange={(v) =>
                          handleActiveChange(row.id, Boolean(v))
                        }
                        disabled={deletingId === row.id}
                        aria-label={
                          row.isActive
                            ? "Visible en la web; pulsar para ocultar"
                            : "Oculto en la web; pulsar para publicar"
                        }
                      />
                      <Label
                        htmlFor={`active-${row.id}`}
                        className="cursor-pointer text-xs text-muted-foreground"
                      >
                        {row.isActive ? "Visible" : "Oculto"}
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-foreground/15"
                        disabled={deletingId === row.id}
                        onClick={() => openEdit(row)}
                      >
                        <PencilLine className="size-4" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                        disabled={deletingId === row.id}
                        onClick={() => handleDelete(row.id)}
                      >
                        {deletingId === row.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <EditShowcaseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        item={editTarget}
        onSaved={mergeSaved}
      />
    </div>
  );
}
