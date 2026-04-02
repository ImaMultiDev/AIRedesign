"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

export type AdminShowcaseRow = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  beforeUrl: string;
  afterUrl: string;
};

type Props = {
  initialItems: AdminShowcaseRow[];
};

async function uploadImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Error de subida");
  }
  return data as { url: string; publicId: string };
}

export function AdminDashboard({ initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!beforeFile || !afterFile) {
      setMessage("Selecciona imagen «Antes» y «Después».");
      return;
    }
    if (!title.trim() || !category.trim()) {
      setMessage("Título y categoría son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const [before, after] = await Promise.all([
        uploadImage(beforeFile),
        uploadImage(afterFile),
      ]);

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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "No se guardó");
      }

      setItems((prev) => [
        {
          id: data.id,
          title: data.title,
          category: data.category,
          description: data.description,
          beforeUrl: data.beforeUrl,
          afterUrl: data.afterUrl,
        },
        ...prev,
      ]);
      setTitle("");
      setCategory("");
      setDescription("");
      setBeforeFile(null);
      setAfterFile(null);
      setMessage("Guardado correctamente.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este ejemplo?")) return;
    const res = await fetch(`/api/showcase/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage("No se pudo eliminar.");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Panel</h1>
          <p className="text-muted-foreground">
            CRUD de ejemplos y subida a Cloudinary.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Cerrar sesión
        </Button>
      </header>

      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Nuevo ejemplo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="before">Foto antes</Label>
                <Input
                  id="before"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setBeforeFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="after">Foto después</Label>
                <Input
                  id="after"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setAfterFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>
            </div>
            {message ? (
              <p
                className={
                  message.includes("correctamente")
                    ? "text-sm text-primary"
                    : "text-sm text-destructive"
                }
              >
                {message}
              </p>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Subir y guardar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 font-heading text-xl tracking-tight">
          Ejemplos ({items.length})
        </h2>
        <Separator className="mb-6" />
        {items.length === 0 ? (
          <p className="text-muted-foreground">
            Aún no hay registros en base de datos. La web pública puede estar
            mostrando datos mock hasta que crees el primero.
          </p>
        ) : (
          <ul className="space-y-6">
            {items.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-4 rounded-xl border border-foreground/10 bg-card p-4 sm:flex-row"
              >
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-40">
                  <Image
                    src={row.afterUrl}
                    alt={`${row.title} — miniatura`}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium">{row.title}</p>
                  <p className="text-sm text-muted-foreground">{row.category}</p>
                  {row.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {row.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="self-start sm:self-center"
                  onClick={() => handleDelete(row.id)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
