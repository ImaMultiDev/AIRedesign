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
};
