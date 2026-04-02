import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const row = await prisma.showcase.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await Promise.all([
    destroyCloudinaryAsset(row.beforePublicId),
    destroyCloudinaryAsset(row.afterPublicId),
  ]);

  await prisma.showcase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const existing = await prisma.showcase.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const data: {
    title?: string;
    category?: string;
    description?: string | null;
    beforeUrl?: string;
    afterUrl?: string;
    beforePublicId?: string | null;
    afterPublicId?: string | null;
    isActive?: boolean;
  } = {};

  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim();
  }
  if (typeof body.category === "string" && body.category.trim()) {
    data.category = body.category.trim();
  }
  if ("description" in body) {
    data.description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;
  }

  if (typeof body.beforeUrl === "string") {
    const next = body.beforeUrl.trim();
    if (next !== existing.beforeUrl) {
      await destroyCloudinaryAsset(existing.beforePublicId);
      data.beforeUrl = next;
      data.beforePublicId =
        typeof body.beforePublicId === "string"
          ? body.beforePublicId.trim()
          : null;
    }
  }

  if (typeof body.afterUrl === "string") {
    const next = body.afterUrl.trim();
    if (next !== existing.afterUrl) {
      await destroyCloudinaryAsset(existing.afterPublicId);
      data.afterUrl = next;
      data.afterPublicId =
        typeof body.afterPublicId === "string"
          ? body.afterPublicId.trim()
          : null;
    }
  }

  if (typeof body.isActive === "boolean") {
    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nada que actualizar" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.showcase.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}
