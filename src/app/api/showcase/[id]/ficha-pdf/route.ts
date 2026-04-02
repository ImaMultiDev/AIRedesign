import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Redirección al PDF solo para clientes Plus autenticados.
 */
export async function GET(_request: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.id ||
    session.user.role !== "USER" ||
    !session.user.isPlus
  ) {
    return NextResponse.json({ error: "Requiere plan Plus" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  try {
    const row = await prisma.showcase.findFirst({
      where: { id, isActive: true },
      select: { technicalPdfUrl: true },
    });
    const url = row?.technicalPdfUrl?.trim();
    if (!url) {
      return NextResponse.json({ error: "No hay ficha para este ejemplo" }, { status: 404 });
    }
    return NextResponse.redirect(url, 302);
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
