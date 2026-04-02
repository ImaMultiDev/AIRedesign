import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10 px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} AIRedesign. Rediseño asistido por IA.
      </p>
      <p className="mt-4">
        <Link
          href="/admin/login"
          className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 underline-offset-4 transition-colors hover:text-muted-foreground hover:underline"
        >
          Acceso interno
        </Link>
      </p>
    </footer>
  );
}
