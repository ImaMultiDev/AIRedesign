import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { replaceShowcasePins } from "@/lib/showcase-pins";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
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
    destroyCloudinaryAsset(row.technicalPdfPublicId, "raw"),
  ]);

  await prisma.showcase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
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
    plusBudgetDetails?: string | null;
    technicalPdfUrl?: string | null;
    technicalPdfPublicId?: string | null;
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

  if ("plusBudgetDetails" in body) {
    data.plusBudgetDetails =
      typeof body.plusBudgetDetails === "string"
        ? body.plusBudgetDetails.trim() || null
        : null;
  }

  if ("technicalPdfUrl" in body && "technicalPdfPublicId" in body) {
    const nextUrl =
      body.technicalPdfUrl == null
        ? null
        : typeof body.technicalPdfUrl === "string"
          ? body.technicalPdfUrl.trim() || null
          : null;
    const nextPid =
      body.technicalPdfPublicId == null
        ? null
        : typeof body.technicalPdfPublicId === "string"
          ? body.technicalPdfPublicId.trim() || null
          : null;
    if (
      existing.technicalPdfPublicId &&
      existing.technicalPdfPublicId !== nextPid
    ) {
      await destroyCloudinaryAsset(existing.technicalPdfPublicId, "raw");
    }
    data.technicalPdfUrl = nextUrl;
    data.technicalPdfPublicId = nextPid;
  }

  let pinsHandled = false;
  if ("pins" in body) {
    try {
      await replaceShowcasePins(id, body.pins);
      pinsHandled = true;
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Pins inválidos",
        },
        { status: 400 },
      );
    }
  }

  if (Object.keys(data).length === 0 && !pinsHandled) {
    return NextResponse.json(
      { error: "Nada que actualizar" },
      { status: 400 },
    );
  }

  try {
    if (Object.keys(data).length > 0) {
      await prisma.showcase.update({
        where: { id },
        data,
      });
    }
    const updated = await prisma.showcase.findUnique({
      where: { id },
      include: {
        productPins: {
          orderBy: { sortOrder: "asc" },
          include: {
            offers: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });
    if (!updated) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}
