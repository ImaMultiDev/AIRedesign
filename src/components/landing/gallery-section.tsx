"use client";

import { useEffect, useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShowcaseCardSplitPreview } from "@/components/landing/showcase-card-split-preview";
import { ShowcaseModal } from "@/components/landing/showcase-modal";
import { GalleryPremiumActions } from "@/components/landing/gallery-premium-actions";
import type { ShowcaseItem } from "@/types/showcase";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

type Props = {
  items: ShowcaseItem[];
};

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "6%" : "-6%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-6%" : "6%",
    opacity: 0,
  }),
};

export function GallerySection({ items }: Props) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ShowcaseItem | null>(null);
  const [page, setPage] = useState(0);
  const [[direction], setDirection] = useState<[number]>([0]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const showPager = items.length > PAGE_SIZE;

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [items.length, totalPages]);

  const pageItems = useMemo(
    () => items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [items, page],
  );

  function goTo(nextPage: number) {
    const clamped = Math.max(0, Math.min(totalPages - 1, nextPage));
    if (clamped === page) return;
    setDirection([clamped > page ? 1 : -1]);
    setPage(clamped);
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };

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
              a pantalla completa y arrastra para revelar la propuesta de IA.
              Al abrir un proyecto,{" "}
              <span className="text-foreground/90">Shop the Look</span> muestra en la
              propuesta IA el comparador multi-tienda (mejor oferta resaltada) como
              muestra del trabajo. Donde haya ficha técnica
              o presupuesto, el acceso completo también está reservado al plan
              Plus.
            </p>
          </motion.div>

          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-foreground/15 bg-muted/30 py-16 text-center text-sm text-muted-foreground">
              Aún no hay ejemplos activos en la galería.
            </p>
          ) : (
            <div
              className={cn(
                "relative",
                showPager && "px-2 sm:px-10 md:px-12",
              )}
            >
              {showPager ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute left-0 top-1/2 z-20 hidden size-11 -translate-y-1/2 rounded-full border-foreground/15 bg-background/90 shadow-md backdrop-blur-sm sm:flex"
                    aria-label="Página anterior"
                    onClick={() => goTo(page - 1)}
                    disabled={page <= 0}
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 z-20 hidden size-11 -translate-y-1/2 rounded-full border-foreground/15 bg-background/90 shadow-md backdrop-blur-sm sm:flex"
                    aria-label="Página siguiente"
                    onClick={() => goTo(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                </>
              ) : null}

              <div className="min-h-[320px] overflow-hidden sm:min-h-[400px] md:min-h-[480px]">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.ul
                    key={page}
                    role="list"
                    custom={direction}
                    variants={slideVariants}
                    initial={reduceMotion ? "center" : "enter"}
                    animate="center"
                    exit={reduceMotion ? "center" : "exit"}
                    transition={transition}
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {pageItems.map((item, i) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: reduceMotion ? 0 : 0.04 * i,
                          duration: reduceMotion ? 0 : 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Card className="group overflow-hidden border-foreground/10 bg-card shadow-sm ring-0 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[0.07]">
                          <button
                            type="button"
                            onClick={() => {
                              setActive(item);
                              setOpen(true);
                            }}
                            className="block w-full text-left"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <ShowcaseCardSplitPreview
                                beforeUrl={item.beforeUrl}
                                afterUrl={item.afterUrl}
                                title={item.title}
                                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                              />
                              <span className="absolute bottom-4 left-4 z-30 rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
                                {item.category}
                              </span>
                              <span className="absolute right-4 top-4 z-30 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 scale-90">
                                <ArrowUpRight className="size-5" aria-hidden />
                              </span>
                            </div>
                            <div className="space-y-1 px-5 py-5">
                              <h3 className="font-heading text-xl tracking-tight text-card-foreground transition-colors group-hover:text-primary">
                                {item.title}
                              </h3>
                              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                {item.description ??
                                  "Toca para comparar antes y la propuesta de IA."}
                              </p>
                            </div>
                          </button>
                          <GalleryPremiumActions item={item} variant="card" />
                        </Card>
                      </motion.li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>

              {showPager ? (
                <div className="mt-8 flex flex-col items-center gap-3 sm:hidden">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={page <= 0}
                      onClick={() => goTo(page - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={page >= totalPages - 1}
                      onClick={() => goTo(page + 1)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {page + 1} / {totalPages}
                  </p>
                </div>
              ) : null}

              {showPager ? (
                <p className="mt-6 hidden text-center text-xs tabular-nums text-muted-foreground sm:block">
                  {page + 1} / {totalPages}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <ShowcaseModal open={open} onOpenChange={setOpen} item={active} />
    </>
  );
}
