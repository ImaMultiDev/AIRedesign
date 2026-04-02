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

/** Home: base de datos si hay datos; si no, mock para validar diseño. */
export async function getShowcasesForHome(): Promise<ShowcaseItem[]> {
  try {
    const rows = await prisma.showcase.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length > 0) return rows.map(rowToItem);
  } catch {
    /* DATABASE_URL ausente o migración pendiente */
  }
  return MOCK_SHOWCASES;
}
