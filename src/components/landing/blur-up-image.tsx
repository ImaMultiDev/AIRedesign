"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  blurDataURL: string;
};

/** Imagen a `fill`; el contenedor padre debe ser `relative` con altura definida. */
export function BlurUpImage({
  src,
  alt,
  sizes,
  className,
  priority,
  blurDataURL,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn(
        "object-cover transition-[filter,opacity,transform] duration-700 ease-out",
        loaded ? "opacity-100 blur-0 scale-100" : "opacity-85 blur-lg scale-[1.03]",
        className,
      )}
      placeholder="blur"
      blurDataURL={blurDataURL}
      sizes={sizes}
      priority={priority}
      onLoadingComplete={() => setLoaded(true)}
    />
  );
}
