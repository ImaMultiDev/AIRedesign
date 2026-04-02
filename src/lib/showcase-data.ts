import { prisma } from "@/lib/prisma";
import { MOCK_SHOWCASES } from "@/data/mock-showcase";
import type { ShowcaseItem } from "@/types/showcase";

function mapDbRow(
  r: {
    id: string;
    title: string;
    category: string;
    description: string | null;
    beforeUrl: string;
    afterUrl: string;
    plusBudgetDetails: string | null;
    technicalPdfUrl: string | null;
    technicalPdfPublicId: string | null;
  },
  viewerIsPlus: boolean,
): ShowcaseItem {
  const hasPdf = !!(
    r.technicalPdfUrl?.trim() || r.technicalPdfPublicId?.trim()
  );
  const hasBudget = !!r.plusBudgetDetails?.trim();
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description,
    beforeUrl: r.beforeUrl,
    afterUrl: r.afterUrl,
    hasPremiumPdf: hasPdf,
    hasPremiumBudget: hasBudget,
    plusBudgetDetails: viewerIsPlus ? r.plusBudgetDetails : null,
  };
}

/**
 * Home: si hay filas en BD, solo `isActive: true`.
 * `viewerIsPlus` controla si se envía el texto de presupuesto al HTML (nunca la URL del PDF).
 */
export async function getShowcasesForHome(
  viewerIsPlus: boolean,
): Promise<ShowcaseItem[]> {
  try {
    const total = await prisma.showcase.count();
    if (total > 0) {
      const rows = await prisma.showcase.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return rows.map((row) => mapDbRow(row, viewerIsPlus));
    }
  } catch {
    /* DATABASE_URL ausente o migración pendiente */
  }
  return MOCK_SHOWCASES;
}
