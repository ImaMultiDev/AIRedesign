import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Casi listo
      </p>
      <h1 className="mt-4 font-heading text-3xl tracking-tight text-foreground md:text-4xl">
        Revisa tu correo
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Hemos enviado un enlace de acceso. Abre el email y pulsa el botón para
        entrar en tu cuenta de AIRedesign.
      </p>
      <Link
        href="/"
        className="mt-10 text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
