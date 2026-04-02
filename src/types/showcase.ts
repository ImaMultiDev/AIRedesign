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
};
