import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeStoreBrand } from "@/lib/retailer-brands";
import { AdminDashboard } from "./admin-dashboard";
import type { AdminShowcaseRow } from "@/types/admin-showcase";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  let initialItems: AdminShowcaseRow[] = [];
  try {
    const rows = await prisma.showcase.findMany({
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
    initialItems = rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      description: r.description,
      beforeUrl: r.beforeUrl,
      afterUrl: r.afterUrl,
      beforePublicId: r.beforePublicId,
      afterPublicId: r.afterPublicId,
      plusBudgetDetails: r.plusBudgetDetails ?? null,
      technicalPdfUrl: r.technicalPdfUrl ?? null,
      technicalPdfPublicId: r.technicalPdfPublicId ?? null,
      isActive: r.isActive,
      productPins: r.productPins.map((p) => ({
        id: p.id,
        positionX: p.positionX,
        positionY: p.positionY,
        name: p.name,
        offers: p.offers.map((o) => ({
          id: o.id,
          storeName: o.storeName,
          storeBrand: normalizeStoreBrand(o.storeBrand),
          thumbnailUrl: o.thumbnailUrl ?? null,
          priceLabel: o.priceLabel,
          sortPrice: o.sortPrice,
          buyUrl: o.buyUrl,
        })),
      })),
    }));
  } catch {
    /* sin DATABASE_URL o sin migraciones */
  }

  return <AdminDashboard initialItems={initialItems} />;
}
