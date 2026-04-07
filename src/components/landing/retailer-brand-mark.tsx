"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  RETAILER_BRAND_LABELS,
  RETAILER_BRAND_LOGO_URL,
  type RetailerBrandId,
} from "@/lib/retailer-brands";

type Props = {
  brand: RetailerBrandId;
  className?: string;
  /** Tamaño del contenedor del logo */
  size?: "sm" | "md";
};

/** Logo del retailer (asset Cloudinary por marca). */
export function RetailerBrandMark({ brand, className, size = "md" }: Props) {
  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const src = RETAILER_BRAND_LOGO_URL[brand];
  const label = RETAILER_BRAND_LABELS[brand];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5",
        dim,
        className,
      )}
      title={label}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-contain p-[3px]"
        sizes={size === "sm" ? "28px" : "36px"}
        unoptimized
      />
    </span>
  );
}
