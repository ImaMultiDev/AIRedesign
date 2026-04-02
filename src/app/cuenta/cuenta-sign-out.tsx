"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function CuentaSignOut() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Salir
    </Button>
  );
}
