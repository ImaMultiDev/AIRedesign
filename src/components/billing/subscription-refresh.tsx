"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Tras Stripe checkout, actualiza el JWT para reflejar isPlus sin cerrar sesión.
 */
export function SubscriptionRefresh() {
  const params = useSearchParams();
  const { update } = useSession();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (params.get("suscrito") !== "1") return;
    done.current = true;
    void update();
  }, [params, update]);

  return null;
}
