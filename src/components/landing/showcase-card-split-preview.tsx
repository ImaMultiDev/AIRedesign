"use client";

import { BlurUpImage } from "@/components/landing/blur-up-image";
import { BLUR_DATA_URL } from "@/data/mock-showcase";

type Props = {
  beforeUrl: string;
  afterUrl: string;
  title: string;
  sizes: string;
};

/**
 * Vista previa estática en tarjetas: mitad izquierda «antes», mitad derecha propuesta IA.
 * Los puntos Shop the Look no se muestran en la home; solo en el modal con comparador.
 */
export function ShowcaseCardSplitPreview({
  beforeUrl,
  afterUrl,
  title,
  sizes,
}: Props) {
  return (
    <div className="relative flex h-full w-full origin-center transition-transform duration-700 ease-out group-hover:scale-[1.04]">
      <div className="relative z-0 w-1/2 overflow-hidden">
        <BlurUpImage
          src={beforeUrl}
          alt={`${title} — antes`}
          sizes={sizes}
          blurDataURL={BLUR_DATA_URL}
          className="object-cover object-left"
        />
      </div>
      <div className="relative z-0 w-1/2 overflow-hidden border-l border-white/25 shadow-[inset_1px_0_0_rgba(255,255,255,0.15)]">
        <BlurUpImage
          src={afterUrl}
          alt={`${title} — propuesta IA`}
          sizes={sizes}
          blurDataURL={BLUR_DATA_URL}
          className="object-cover object-right"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95"
        aria-hidden
      />
    </div>
  );
}
