/** Slugs guardados en BD y reconocidos en la UI del comparador. */
export const RETAILER_BRAND_IDS = [
  "amazon",
  "ikea",
  "leroy_merlin",
  "temu",
  "aliexpress",
  "mediamarkt",
  "carrefour",
  "fnac",
  "other",
] as const;

export type RetailerBrandId = (typeof RETAILER_BRAND_IDS)[number];

export const RETAILER_BRAND_LABELS: Record<RetailerBrandId, string> = {
  amazon: "Amazon",
  ikea: "IKEA",
  leroy_merlin: "Leroy Merlin",
  temu: "Temu",
  aliexpress: "AliExpress",
  mediamarkt: "MediaMarkt",
  carrefour: "Carrefour",
  fnac: "Fnac",
  other: "Otra tienda",
};

/** Logos oficiales / assets en Cloudinary para cada retailer. */
export const RETAILER_BRAND_LOGO_URL: Record<RetailerBrandId, string> = {
  amazon:
    "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531513/articulos-357179_jrva2m.jpg",
  leroy_merlin:
    "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531153/unnamed_1_joynfr.png",
  mediamarkt:
    "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531153/media-markt_jgmfll.png",
  ikea: "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531152/unnamed_r2bria.png",
  aliexpress:
    "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531152/logo-aliexpress_hbarvx.jpg",
  temu: "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531152/31ijebr0sWL_eeo0in.png",
  carrefour:
    "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531152/images_qzit3i.jpg",
  fnac: "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531152/Fnac-Logo-1985_b5ujty.jpg",
  other:
    "https://res.cloudinary.com/dokzeu1y5/image/upload/v1775531399/store-icon-logo-illustration-vector_n51jzf.webp",
};

export function normalizeStoreBrand(raw: unknown): RetailerBrandId {
  if (typeof raw !== "string") return "other";
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (s === "el_corte_ingles") return "other";
  if ((RETAILER_BRAND_IDS as readonly string[]).includes(s)) {
    return s as RetailerBrandId;
  }
  return "other";
}
