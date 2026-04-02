import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const rows = await prisma.proposalRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    const items = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      tierRequested: r.tierRequested,
      status: r.status,
      basicSummary: r.basicSummary,
      plusBudgetDetails: r.plusBudgetDetails,
      technicalPdfUrl: r.technicalPdfUrl,
      technicalPdfPublicId: r.technicalPdfPublicId,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      user: {
        id: r.user.id,
        email: r.user.email,
        name: r.user.name,
        subscriptionStatus: r.user.subscriptionStatus,
      },
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Error al listar" }, { status: 500 });
  }
}
