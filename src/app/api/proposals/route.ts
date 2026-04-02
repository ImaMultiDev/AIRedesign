import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalStatus } from "@prisma/client";

function canViewPlusContent(
  tierRequested: string,
  status: ProposalStatus,
  isPlus: boolean,
): boolean {
  if (tierRequested !== "PLUS") return true;
  if (status === ProposalStatus.PLUS_DELIVERED) return true;
  return isPlus;
}

function jsonProposal(
  row: {
    id: string;
    title: string | null;
    description: string;
    tierRequested: string;
    status: ProposalStatus;
    basicSummary: string | null;
    plusBudgetDetails: string | null;
    technicalPdfUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  sessionPlus: boolean,
) {
  const unlock = canViewPlusContent(
    row.tierRequested,
    row.status,
    sessionPlus,
  );
  const hasPlusAssets =
    !!(row.plusBudgetDetails?.trim() || row.technicalPdfUrl?.trim());
  const plusAssetsHeld =
    row.tierRequested === "PLUS" && !unlock && hasPlusAssets;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tierRequested: row.tierRequested,
    status: row.status,
    basicSummary: row.basicSummary,
    plusBudgetDetails: unlock ? row.plusBudgetDetails : null,
    technicalPdfUrl: unlock ? row.technicalPdfUrl : null,
    plusAssetsHeld,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "USER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const rows = await prisma.proposalRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      items: rows.map((r) => jsonProposal(r, session.user.isPlus)),
    });
  } catch {
    return NextResponse.json({ error: "Error al listar" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "USER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const title =
    typeof body === "object" && body && "title" in body
      ? String((body as { title?: unknown }).title ?? "").trim() || null
      : null;
  const description =
    typeof body === "object" && body && "description" in body
      ? String((body as { description?: unknown }).description ?? "").trim()
      : "";
  const tierRaw =
    typeof body === "object" && body && "tierRequested" in body
      ? String((body as { tierRequested?: unknown }).tierRequested ?? "BASIC")
          .toUpperCase()
          .trim()
      : "BASIC";

  const tierRequested = tierRaw === "PLUS" ? "PLUS" : "BASIC";

  if (description.length < 8) {
    return NextResponse.json(
      { error: "Describe tu proyecto con al menos 8 caracteres" },
      { status: 400 },
    );
  }

  if (tierRequested === "PLUS" && !session.user.isPlus) {
    return NextResponse.json(
      { error: "PLUS_REQUIRED", message: "Suscripción Plus requerida" },
      { status: 402 },
    );
  }

  try {
    const row = await prisma.proposalRequest.create({
      data: {
        userId: session.user.id,
        title,
        description,
        tierRequested,
        status: ProposalStatus.SUBMITTED,
      },
    });
    return NextResponse.json(jsonProposal(row, session.user.isPlus), {
      status: 201,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo crear" }, { status: 500 });
  }
}
