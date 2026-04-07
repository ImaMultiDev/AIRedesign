import type { RetailerBrandId } from "@/lib/retailer-brands";

export type AdminShowcasePinOffer = {
  id: string;
  storeName: string;
  storeBrand: RetailerBrandId;
  thumbnailUrl: string | null;
  priceLabel: string;
  sortPrice: number;
  buyUrl: string;
};

export type AdminShowcasePin = {
  id: string;
  positionX: number;
  positionY: number;
  name: string;
  offers: AdminShowcasePinOffer[];
};

export type AdminShowcaseRow = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  beforeUrl: string;
  afterUrl: string;
  beforePublicId: string | null;
  afterPublicId: string | null;
  plusBudgetDetails: string | null;
  technicalPdfUrl: string | null;
  /** @internal admin */
  technicalPdfPublicId: string | null;
  isActive: boolean;
  productPins: AdminShowcasePin[];
};
