"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/cuenta";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await signIn("email", {
        email: email.trim(),
        callbackUrl,
        redirect: true,
      });
    } catch {
      setMessage("No se pudo enviar el enlace. Revisa Resend y el email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-foreground/10 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="font-heading text-2xl tracking-tight">
          Tu espacio AIRedesign
        </CardTitle>
        <CardDescription>
          Te enviamos un enlace mágico al correo. Sin contraseñas: entras en un
          clic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-login">Email</Label>
            <Input
              id="email-login"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              placeholder="tu@email.com"
            />
          </div>
          {message ? (
            <p className="text-sm text-destructive" role="alert">
              {message}
            </p>
          ) : null}
          <Button
            type="submit"
            className="h-11 w-full rounded-full"
            disabled={loading}
          >
            {loading ? "Enviando…" : "Recibir enlace"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link
            href="/admin/login"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Acceso interno del equipo
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-16">
      <Link
        href="/"
        className="mb-10 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Volver al inicio
      </Link>
      <Suspense
        fallback={
          <div className="h-48 w-full max-w-md animate-pulse rounded-2xl bg-muted/40" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
