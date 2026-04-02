"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BlurUpImage } from "@/components/landing/blur-up-image";
import { ShowcaseModal } from "@/components/landing/showcase-modal";
import { BLUR_DATA_URL } from "@/data/mock-showcase";
import type { ShowcaseItem } from "@/types/showcase";
import { ArrowUpRight } from "lucide-react";

type Props = {
  items: ShowcaseItem[];
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.06 * i,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function GallerySection({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ShowcaseItem | null>(null);

  return (
    <>
      <section
        id="galeria"
        className="scroll-mt-20 border-t border-foreground/[0.06] bg-background px-6 py-24 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16 max-w-2xl space-y-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Galería
            </p>
            <h2 className="font-heading text-4xl tracking-tight text-foreground md:text-5xl">
              Antes y después, en un gesto
            </h2>
            <p className="text-lg text-muted-foreground">
              Cada tarjeta es un proyecto real de estilo. Abre el comparador
              a pantalla completa y arrastra para revelar el resultado.
            </p>
          </motion.div>

          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <motion.li
                key={item.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={cardVariants}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActive(item);
                    setOpen(true);
                  }}
                  className="group block w-full text-left"
                >
                  <Card className="overflow-hidden border-foreground/10 bg-card shadow-sm ring-0 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[0.07]">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <BlurUpImage
                        src={item.afterUrl}
                        alt={`${item.title} — vista previa`}
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        blurDataURL={BLUR_DATA_URL}
                        className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
                        {item.category}
                      </span>
                      <span className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-90">
                        <ArrowUpRight className="size-5" aria-hidden />
                      </span>
                    </div>
                    <div className="space-y-1 px-5 py-5">
                      <h3 className="font-heading text-xl tracking-tight text-card-foreground transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description ?? "Toca para comparar antes y después."}
                      </p>
                    </div>
                  </Card>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <ShowcaseModal open={open} onOpenChange={setOpen} item={active} />
    </>
  );
}
