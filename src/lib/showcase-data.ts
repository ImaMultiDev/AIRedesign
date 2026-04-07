import { prisma } from "@/lib/prisma";
import { MOCK_SHOWCASES } from "@/data/mock-showcase";
import type { ShowcaseItem } from "@/types/showcase";
import { serializePinsForPublic, type PinRow } from "@/lib/showcase-pins";

function mapDbRow(
  row: {
    id: string;
    title: string;
    category: string;
    description: string | null;
    beforeUrl: string;
    afterUrl: string;
    plusBudgetDetails: string | null;
    technicalPdfUrl: string | null;
    technicalPdfPublicId: string | null;
    productPins: {
      id: string;
      positionX: number;
      positionY: number;
      name: string;
      sortOrder: number;
      offers: {
        id: string;
        storeName: string;
        storeBrand: string;
        thumbnailUrl: string | null;
        priceLabel: string;
        sortPrice: number;
        buyUrl: string;
        sortOrder: number;
      }[];
    }[];
  },
  viewerIsPlus: boolean,
): ShowcaseItem {
  const hasPdf = !!(
    row.technicalPdfUrl?.trim() || row.technicalPdfPublicId?.trim()
  );
  const hasBudget = !!row.plusBudgetDetails?.trim();
  const pinsOrdered = [...row.productPins].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const pinRows: PinRow[] = pinsOrdered.map((p) => ({
    id: p.id,
    positionX: p.positionX,
    positionY: p.positionY,
    name: p.name,
    sortOrder: p.sortOrder,
    offers: [...p.offers]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((o) => ({
        id: o.id,
        storeName: o.storeName,
        storeBrand: o.storeBrand ?? "other",
        thumbnailUrl: o.thumbnailUrl ?? null,
        priceLabel: o.priceLabel,
        sortPrice: o.sortPrice,
        buyUrl: o.buyUrl,
        sortOrder: o.sortOrder,
      })),
  }));
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    beforeUrl: row.beforeUrl,
    afterUrl: row.afterUrl,
    hasPremiumPdf: hasPdf,
    hasPremiumBudget: hasBudget,
    plusBudgetDetails: viewerIsPlus ? row.plusBudgetDetails : null,
    shopPins: serializePinsForPublic(pinRows),
  };
}

/**
 * Home: si hay filas en BD, solo `isActive: true`.
 * `viewerIsPlus` controla presupuesto en claro y datos de Shop the Look.
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
        include: {
          productPins: {
            orderBy: { sortOrder: "asc" },
            include: {
              offers: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      });
      return rows.map((row) => mapDbRow(row, viewerIsPlus));
    }
  } catch {
    /* DATABASE_URL ausente o migración pendiente */
  }
  return MOCK_SHOWCASES;
}
