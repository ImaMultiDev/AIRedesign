/** Parsea un precio de ordenación desde etiqueta y/o valor explícito (cliente o servidor). */
export function parseSortPriceNumberOnly(
  priceLabel: string,
  sortPriceRaw?: unknown,
): number {
  if (typeof sortPriceRaw === "number" && Number.isFinite(sortPriceRaw)) {
    return sortPriceRaw;
  }
  if (typeof sortPriceRaw === "string") {
    const t = sortPriceRaw.trim().replace(/\s/g, "").replace(",", ".");
    const n = parseFloat(t);
    if (Number.isFinite(n)) return n;
  }
  const label = priceLabel.trim();
  if (!label) return Number.POSITIVE_INFINITY;
  const compact = label.replace(/[^\d.,]/g, "");
  if (!compact) return Number.POSITIVE_INFINITY;
  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  let normalized = compact;
  if (lastComma > lastDot && lastComma !== -1) {
    normalized = compact.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma && lastDot !== -1) {
    normalized = compact.replace(/,/g, "");
  } else if (compact.includes(",")) {
    normalized = compact.replace(",", ".");
  }
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}
