import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProposalStatus } from "@prisma/client";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";
import { sendProposalDeliveredEmail } from "@/lib/resend-mail";

type Ctx = { params: Promise<{ id: string }> };

const allowedStatuses = new Set<string>(Object.values(ProposalStatus));

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const existing = await prisma.proposalRequest.findUnique({
    where: { id },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const data: {
    status?: ProposalStatus;
    basicSummary?: string | null;
    plusBudgetDetails?: string | null;
    technicalPdfUrl?: string | null;
    technicalPdfPublicId?: string | null;
  } = {};

  if (typeof body.status === "string") {
    if (!allowedStatuses.has(body.status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    data.status = body.status as ProposalStatus;
  }
  if ("basicSummary" in body) {
    const v = body.basicSummary;
    data.basicSummary =
      v === null || v === undefined ? null : String(v).trim() || null;
  }
  if ("plusBudgetDetails" in body) {
    const v = body.plusBudgetDetails;
    data.plusBudgetDetails =
      v === null || v === undefined ? null : String(v).trim() || null;
  }
  if ("technicalPdfUrl" in body) {
    const v = body.technicalPdfUrl;
    data.technicalPdfUrl =
      v === null || v === undefined ? null : String(v).trim() || null;
  }
  if ("technicalPdfPublicId" in body) {
    const v = body.technicalPdfPublicId;
    data.technicalPdfPublicId =
      v === null || v === undefined ? null : String(v).trim() || null;
  }

  if (
    data.technicalPdfPublicId !== undefined &&
    data.technicalPdfPublicId !== existing.technicalPdfPublicId &&
    existing.technicalPdfPublicId
  ) {
    await destroyCloudinaryAsset(existing.technicalPdfPublicId, "raw");
  }

  const nextStatus = data.status ?? existing.status;
  const shouldNotify =
    nextStatus === ProposalStatus.PLUS_DELIVERED &&
    existing.status !== ProposalStatus.PLUS_DELIVERED;

  const row = await prisma.proposalRequest.update({
    where: { id },
    data,
  });

  if (shouldNotify && existing.user.email) {
    const label = existing.title?.trim() || "Tu solicitud";
    await sendProposalDeliveredEmail(
      existing.user.email,
      label,
      row.id,
      existing.user.name,
    );
  }

  return NextResponse.json({
    id: row.id,
    status: row.status,
    basicSummary: row.basicSummary,
    plusBudgetDetails: row.plusBudgetDetails,
    technicalPdfUrl: row.technicalPdfUrl,
    technicalPdfPublicId: row.technicalPdfPublicId,
    updatedAt: row.updatedAt.toISOString(),
  });
}
