import { prisma } from "@/lib/prisma";
import { MOCK_SHOWCASES } from "@/data/mock-showcase";
import type { ShowcaseItem } from "@/types/showcase";

function rowToItem(r: {
  id: string;
  title: string;
  category: string;
  description: string | null;
  beforeUrl: string;
  afterUrl: string;
}): ShowcaseItem {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description,
    beforeUrl: r.beforeUrl,
    afterUrl: r.afterUrl,
  };
}

/**
 * Home: si hay filas en BD, solo `isActive: true`. Si la BD está vacía o falla,
 * se usan mocks (siempre “publicados” para la demo).
 */
export async function getShowcasesForHome(): Promise<ShowcaseItem[]> {
  try {
    const total = await prisma.showcase.count();
    if (total > 0) {
      const rows = await prisma.showcase.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return rows.map(rowToItem);
    }
  } catch {
    /* DATABASE_URL ausente o migración pendiente */
  }
  return MOCK_SHOWCASES;
}
