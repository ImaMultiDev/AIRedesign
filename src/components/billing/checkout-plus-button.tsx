"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

type Props = Omit<ComponentProps<typeof Button>, "onClick"> & {
  children?: React.ReactNode;
};

export function CheckoutPlusButton({ children, className, ...rest }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/pricing")}`);
      return;
    }
    if (session?.user?.role !== "USER") {
      router.push("/login?callbackUrl=/pricing");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "No se pudo iniciar el pago",
        );
      }
      const url = data.url as string | undefined;
      if (url) window.location.href = url;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      {...rest}
      className={className}
      disabled={loading || rest.disabled}
      onClick={startCheckout}
    >
      {loading ? "Preparando checkout…" : (children ?? "Suscribirme a Plus")}
    </Button>
  );
}
