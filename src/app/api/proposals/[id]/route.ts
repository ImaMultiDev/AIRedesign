import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { ProposalStatus } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

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

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "USER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  try {
    const row = await prisma.proposalRequest.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!row) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json(jsonProposal(row, session.user.isPlus));
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
