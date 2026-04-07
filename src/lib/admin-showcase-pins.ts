import type { AdminShowcasePin } from "@/types/admin-showcase";
import { normalizeStoreBrand } from "@/lib/retailer-brands";

/** Normaliza `productPins` devueltos por las APIs admin (Prisma JSON). */
export function productPinsFromApiResponse(data: unknown): AdminShowcasePin[] {
  if (!Array.isArray(data)) return [];
  const out: AdminShowcasePin[] = [];
  for (const p of data) {
    if (!p || typeof p !== "object") continue;
    const o = p as Record<string, unknown>;
    if (typeof o.id !== "string") continue;
    const offersRaw = o.offers;
    const offers: AdminShowcasePin["offers"] = [];
    if (Array.isArray(offersRaw)) {
      for (const x of offersRaw) {
        if (!x || typeof x !== "object") continue;
        const r = x as Record<string, unknown>;
        if (typeof r.id !== "string") continue;
        const thumb =
          r.thumbnailUrl == null || r.thumbnailUrl === ""
            ? null
            : typeof r.thumbnailUrl === "string"
              ? r.thumbnailUrl
              : null;
        offers.push({
          id: r.id,
          storeName: typeof r.storeName === "string" ? r.storeName : "",
          storeBrand: normalizeStoreBrand(r.storeBrand),
          thumbnailUrl: thumb,
          priceLabel: typeof r.priceLabel === "string" ? r.priceLabel : "",
          sortPrice: Number(r.sortPrice),
          buyUrl: typeof r.buyUrl === "string" ? r.buyUrl : "",
        });
      }
    }
    out.push({
      id: o.id,
      positionX: Number(o.positionX),
      positionY: Number(o.positionY),
      name: typeof o.name === "string" ? o.name : "",
      offers,
    });
  }
  return out;
}
