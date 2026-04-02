"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BeforeAfterSlider } from "@/components/landing/before-after-slider";
import { motion } from "framer-motion";
import type { ShowcaseItem } from "@/types/showcase";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ShowcaseItem | null;
};

export function ShowcaseModal({ open, onOpenChange, item }: Props) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-none w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-background p-0 text-foreground shadow-none ring-0 sm:max-w-none [&_[data-slot=dialog-close]]:top-5 [&_[data-slot=dialog-close]]:right-5"
      >
        <DialogTitle className="sr-only">{item.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Comparador antes y después para {item.title}
        </DialogDescription>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-4 pb-10 pt-20 sm:px-8 lg:px-12"
        >
          <header className="mx-auto max-w-4xl space-y-3 text-center">
            <Badge
              variant="secondary"
              className="rounded-full border border-foreground/10 bg-background px-4 py-1 text-xs font-normal tracking-wide text-muted-foreground"
            >
              {item.category}
            </Badge>
            <h2 className="font-heading text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {item.title}
            </h2>
            {item.description ? (
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {item.description}
              </p>
            ) : null}
          </header>

          <div className="mx-auto w-full max-w-5xl flex-1">
            <BeforeAfterSlider
              beforeUrl={item.beforeUrl}
              afterUrl={item.afterUrl}
              beforeAlt={`Antes — ${item.title}`}
              afterAlt={`Después — ${item.title}`}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Arrastra el control central para comparar.
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
