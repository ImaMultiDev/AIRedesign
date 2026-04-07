import type { RetailerBrandId } from "@/lib/retailer-brands";

/** Oferta de compra en un pin; ordenadas de menor a mayor `sortPrice`. */
export type ShopPinOfferPublic = {
  id: string;
  storeName: string;
  storeBrand: RetailerBrandId;
  thumbnailUrl: string | null;
  priceLabel: string;
  sortPrice: number;
  buyUrl: string;
  isBestOffer: boolean;
};

/** Punto Shop the Look (visible para todos: muestra del trabajo en galería). */
export type ShopPinPublic = {
  id: string;
  positionX: number;
  positionY: number;
  name: string;
  offers: ShopPinOfferPublic[];
};

export type ShowcaseItem = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  beforeUrl: string;
  afterUrl: string;
  /** Existe PDF en servidor (URL no expuesta a no Plus) */
  hasPremiumPdf: boolean;
  /** Existe texto de presupuesto (texto solo se envía si el visitante es Plus) */
  hasPremiumBudget: boolean;
  /** Detalle presupuesto; solo viene rellenado para usuario Plus (SSR) */
  plusBudgetDetails: string | null;
  /** Etiquetas de producto sobre la imagen «después» (público) */
  shopPins: ShopPinPublic[];
};
