import type { ShowcaseItem } from "@/types/showcase";

/** LQIP neutro para blur-up con next/image */
export const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

/** Datos demo hasta conectar la base de datos */
const premiumDefaults = {
  hasPremiumPdf: false,
  hasPremiumBudget: false,
  plusBudgetDetails: null as string | null,
  shopPins: [] as ShowcaseItem["shopPins"],
};

export const MOCK_SHOWCASES: ShowcaseItem[] = [
  {
    id: "mock-1",
    title: "Salón luminoso",
    category: "Estancia principal",
    description:
      "De estancia apagada a un salón abierto con luz natural, texturas cálidas y mobiliario escultural.",
    beforeUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
    ...premiumDefaults,
  },
  {
    id: "mock-2",
    title: "Cocina editorial",
    category: "Cocina",
    description:
      "Líneas limpias, encimera continua y acentos metálicos para un look magazine-worthy.",
    beforeUrl:
      "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1400&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=80",
    ...premiumDefaults,
  },
  {
    id: "mock-3",
    title: "Loft industrial suavizado",
    category: "Loft",
    description:
      "Mantiene el carácter del espacio, añadiendo calidez y zonificación con luz indirecta.",
    beforeUrl:
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80",
    ...premiumDefaults,
  },
  {
    id: "mock-4",
    title: "Garaje futurista",
    category: "Multifunción",
    description:
      "Workshop y sala de presentación: piso epoxi, iluminación lineal y acústica contenida.",
    beforeUrl:
      "https://images.unsplash.com/photo-1581147036323-20cf2ee20ec9?auto=format&fit=crop&w=1400&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1400&q=80",
    ...premiumDefaults,
  },
  {
    id: "mock-5",
    title: "Dormitorio boutique hotel",
    category: "Descanso",
    description:
      "Cabecero textil, iluminación cálida de lectura y tonalidades tierra para desconectar.",
    beforeUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1616594039964-ae9021e550fd?auto=format&fit=crop&w=1400&q=80",
    ...premiumDefaults,
  },
  {
    id: "mock-6",
    title: "Terraza urbana",
    category: "Exterior",
    description:
      "Verde estructurado, pérgola ligera y mobiliario de exterior que invita a quedarse.",
    beforeUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    ...premiumDefaults,
  },
];
