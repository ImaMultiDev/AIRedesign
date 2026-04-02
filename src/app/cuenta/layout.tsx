import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CuentaSignOut } from "@/app/cuenta/cuenta-sign-out";

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "USER") {
    redirect(`/login?callbackUrl=${encodeURIComponent("/cuenta")}`);
  }

  return (
    <div className="min-h-[100dvh] bg-[oklch(0.985_0.006_85)]">
      <header className="border-b border-foreground/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-6">
          <Link
            href="/cuenta"
            className="font-heading text-sm font-medium tracking-tight text-foreground"
          >
            Mi cuenta
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/cuenta/solicitud"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Nueva solicitud
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Plus
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground",
              )}
            >
              Inicio
            </Link>
            <CuentaSignOut />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">{children}</div>
    </div>
  );
}
