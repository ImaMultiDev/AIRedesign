import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShowcasesForHome } from "@/lib/showcase-data";

/** Público: mismos datos que la home (DB o mock). */
export async function GET() {
  try {
    const items = await getShowcasesForHome();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "No se pudo leer" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const category = typeof b.category === "string" ? b.category.trim() : "";
  const beforeUrl = typeof b.beforeUrl === "string" ? b.beforeUrl.trim() : "";
  const afterUrl = typeof b.afterUrl === "string" ? b.afterUrl.trim() : "";
  const description =
    typeof b.description === "string" ? b.description.trim() || null : null;
  const beforePublicId =
    typeof b.beforePublicId === "string" ? b.beforePublicId.trim() : null;
  const afterPublicId =
    typeof b.afterPublicId === "string" ? b.afterPublicId.trim() : null;

  if (!title || !category || !beforeUrl || !afterUrl) {
    return NextResponse.json(
      { error: "Título, categoría y ambas URLs son obligatorios" },
      { status: 400 },
    );
  }

  try {
    const last = await prisma.showcase.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (last?.sortOrder ?? 0) + 1;

    const isActive =
      typeof b.isActive === "boolean" ? b.isActive : true;

    const created = await prisma.showcase.create({
      data: {
        title,
        category,
        description,
        beforeUrl,
        afterUrl,
        beforePublicId: beforePublicId || null,
        afterPublicId: afterPublicId || null,
        sortOrder,
        isActive,
      },
    });
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
}
