"use client";

import Image from "next/image";
import { RetailerBrandMark } from "@/components/landing/retailer-brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ShopPinOfferPublic } from "@/types/showcase";
import type { RetailerBrandId } from "@/lib/retailer-brands";
import { ExternalLink, ImageOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  offer: ShopPinOfferPublic;
  /** Nombre del producto (punto) para el alt de la miniatura */
  productName: string;
};

export function ShopOfferCard({ offer, productName }: Props) {
  const brand = offer.storeBrand as RetailerBrandId;
  const hasThumb =
    typeof offer.thumbnailUrl === "string" &&
    offer.thumbnailUrl.trim().length > 0;

  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card text-card-foreground transition-shadow duration-300",
        offer.isBestOffer
          ? "border-primary/35 shadow-lg shadow-primary/[0.12] ring-1 ring-primary/15"
          : "border-foreground/[0.08] shadow-md hover:shadow-lg hover:border-foreground/12",
      )}
    >
      {offer.isBestOffer ? (
        <div className="absolute right-3 top-3 z-10">
          <Badge className="gap-1 rounded-full border-primary/30 bg-primary/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary shadow-sm backdrop-blur-sm">
            <Sparkles className="size-3" aria-hidden />
            Mejor oferta
          </Badge>
        </div>
      ) : null}

      <div className="flex gap-0 sm:gap-0">
        <div
          className={cn(
            "relative h-28 w-28 shrink-0 sm:h-32 sm:w-32",
            "bg-gradient-to-br from-muted to-muted/40",
          )}
        >
          {hasThumb ? (
            <Image
              src={offer.thumbnailUrl!.trim()}
              alt={`${productName} — ${offer.storeName}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="128px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImageOff className="size-8 opacity-35" strokeWidth={1.25} />
              <span className="px-2 text-center text-[9px] font-medium uppercase tracking-wider opacity-70">
                Sin foto
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <RetailerBrandMark brand={brand} size="sm" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {offer.storeName}
              </span>
            </div>
            <p
              className={cn(
                "font-heading text-xl font-semibold tabular-nums tracking-tight sm:text-2xl",
                offer.isBestOffer ? "text-primary" : "text-foreground",
              )}
            >
              {offer.priceLabel}
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Precio orientativo en tienda. Comprueba disponibilidad y envío en
              el enlace.
            </p>
          </div>

          <a
            href={offer.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({
                variant: offer.isBestOffer ? "default" : "outline",
                size: "default",
              }),
              "h-11 w-full gap-2 rounded-full text-sm font-medium shadow-sm transition-[transform,box-shadow] active:scale-[0.99]",
              offer.isBestOffer && "shadow-primary/25",
            )}
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden />
            Ir a la tienda
          </a>
        </div>
      </div>
    </li>
  );
}
