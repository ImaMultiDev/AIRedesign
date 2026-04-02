"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        richColors
        closeButton
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "rounded-xl border-foreground/10 shadow-lg",
          },
        }}
      />
    </SessionProvider>
  );
}
