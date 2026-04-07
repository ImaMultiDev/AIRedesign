import type { ShopPinOfferPublic, ShopPinPublic } from "@/types/showcase";
import { prisma } from "@/lib/prisma";
import { parseSortPriceNumberOnly } from "@/lib/parse-sort-price";
import { normalizeStoreBrand } from "@/lib/retailer-brands";

export type PinOfferRow = {
  id: string;
  storeName: string;
  storeBrand: string;
  thumbnailUrl: string | null;
  priceLabel: string;
  sortPrice: number;
  buyUrl: string;
  sortOrder: number;
};

export type PinRow = {
  id: string;
  positionX: number;
  positionY: number;
  name: string;
  sortOrder: number;
  offers: PinOfferRow[];
};

function sortOffersForPublic(offers: PinOfferRow[]): ShopPinOfferPublic[] {
  const sorted = [...offers].sort((a, b) => {
    if (a.sortPrice !== b.sortPrice) return a.sortPrice - b.sortPrice;
    return a.sortOrder - b.sortOrder;
  });
  return sorted.map((o, idx) => ({
    id: o.id,
    storeName: o.storeName,
    storeBrand: normalizeStoreBrand(o.storeBrand),
    thumbnailUrl: o.thumbnailUrl,
    priceLabel: o.priceLabel,
    sortPrice: o.sortPrice,
    buyUrl: o.buyUrl,
    isBestOffer: idx === 0,
  }));
}

/** Shop the Look es público: muestra de trabajo completo para cualquier visitante. */
export function serializePinsForPublic(pins: PinRow[]): ShopPinPublic[] {
  return pins.map((p) => ({
    id: p.id,
    positionX: p.positionX,
    positionY: p.positionY,
    name: p.name,
    offers: sortOffersForPublic(p.offers),
  }));
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function isValidBuyUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

type OfferInput = {
  storeName?: unknown;
  storeBrand?: unknown;
  thumbnailUrl?: unknown;
  buyUrl?: unknown;
  priceLabel?: unknown;
  sortPrice?: unknown;
};

type PinInput = {
  positionX: unknown;
  positionY: unknown;
  name?: unknown;
  offers?: unknown;
  /** Legado: un enlace único por pin */
  buyUrl?: unknown;
  price?: unknown;
};

/** Sustituye todos los pins de un escaparate (solo invocar desde API admin). */
export async function replaceShowcasePins(
  showcaseId: string,
  raw: unknown,
): Promise<void> {
  if (!Array.isArray(raw)) {
    throw new Error("pins debe ser un array");
  }

  type NormalizedOffer = {
    storeName: string;
    storeBrand: string;
    thumbnailUrl: string | null;
    priceLabel: string;
    sortPrice: number;
    buyUrl: string;
  };
  type NormalizedPin = {
    positionX: number;
    positionY: number;
    name: string;
    offers: NormalizedOffer[];
  };

  const normalizedPins: NormalizedPin[] = [];

  for (const entry of raw as PinInput[]) {
    const productName =
      typeof entry.name === "string" ? entry.name.trim() : "";
    if (!productName) continue;

    let offersRaw = entry.offers;
    if (!Array.isArray(offersRaw) || offersRaw.length === 0) {
      const legacyUrl =
        typeof entry.buyUrl === "string" ? entry.buyUrl.trim() : "";
      if (legacyUrl && isValidBuyUrl(legacyUrl)) {
        const priceStr =
          entry.price == null
            ? ""
            : typeof entry.price === "string"
              ? entry.price.trim()
              : String(entry.price).trim();
        offersRaw = [
          {
            storeName: "Tienda",
            storeBrand: "other",
            thumbnailUrl: null,
            buyUrl: legacyUrl,
            priceLabel: priceStr || "—",
            sortPrice: parseSortPriceNumberOnly(priceStr || "0", undefined),
          },
        ];
      } else {
        continue;
      }
    }

    const offers: NormalizedOffer[] = [];
    for (const o of offersRaw as OfferInput[]) {
      const storeName =
        typeof o.storeName === "string" ? o.storeName.trim() : "";
      const buyUrl =
        typeof o.buyUrl === "string" ? o.buyUrl.trim() : "";
      const priceLabel =
        typeof o.priceLabel === "string" ? o.priceLabel.trim() : "";
      if (!storeName || !buyUrl || !isValidBuyUrl(buyUrl)) {
        continue;
      }
      const sortPrice = parseSortPriceNumberOnly(priceLabel || "0", o.sortPrice);
      const label =
        priceLabel ||
        (Number.isFinite(sortPrice) && sortPrice !== Number.POSITIVE_INFINITY
          ? `${sortPrice} €`
          : "—");
      const thumbRaw =
        o.thumbnailUrl == null
          ? ""
          : typeof o.thumbnailUrl === "string"
            ? o.thumbnailUrl.trim()
            : "";
      let thumbnailUrl: string | null = null;
      if (thumbRaw && isValidBuyUrl(thumbRaw)) {
        thumbnailUrl = thumbRaw.slice(0, 2048);
      }
      offers.push({
        storeName: storeName.slice(0, 120),
        storeBrand: normalizeStoreBrand(o.storeBrand),
        thumbnailUrl,
        priceLabel: label.slice(0, 120),
        sortPrice,
        buyUrl: buyUrl.slice(0, 2048),
      });
    }

    if (offers.length === 0) continue;

    normalizedPins.push({
      positionX: clamp01(Number(entry.positionX)),
      positionY: clamp01(Number(entry.positionY)),
      name: productName.slice(0, 200),
      offers,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.showcaseProductPin.deleteMany({ where: { showcaseId } });
    for (let i = 0; i < normalizedPins.length; i++) {
      const p = normalizedPins[i];
      await tx.showcaseProductPin.create({
        data: {
          showcaseId,
          positionX: p.positionX,
          positionY: p.positionY,
          name: p.name,
          sortOrder: i,
          offers: {
            create: p.offers.map((o, j) => ({
              storeName: o.storeName,
              storeBrand: o.storeBrand,
              thumbnailUrl: o.thumbnailUrl,
              priceLabel: o.priceLabel,
              sortPrice: o.sortPrice,
              buyUrl: o.buyUrl,
              sortOrder: j,
            })),
          },
        },
      });
    }
  });
}
